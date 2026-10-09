const urlsInput = document.querySelector('#urls');
const status = document.querySelector('#status');
const openButton = document.querySelector('#open-windows');
const isExtension = typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
let importableTabs = [];
let floatingControlsVisible = true;

if (isExtension) {
  chrome.storage.local.get('recentUrls').then(({ recentUrls }) => {
    if (recentUrls) urlsInput.value = recentUrls;
  });
} else {
  document.querySelector('#install-notice').hidden = false;
  document.querySelectorAll('button').forEach(button => { button.disabled = true; });
}

function show(message, error = false) {
  status.textContent = message;
  status.classList.toggle('error', error);
}

function updateFloatingControlsButton() {
  document.querySelector('#toggle-floating-controls').textContent = floatingControlsVisible ? '隐藏' : '显示';
}

function parseUrls() {
  const urls = urlsInput.value.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const valid = [];
  for (const value of urls) {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      valid.push(url.href);
    } catch (_) {
      throw new Error(`不是有效网页地址：${value}`);
    }
  }
  if (!valid.length) throw new Error('请至少输入一个网页地址。');
  if (valid.length > 12) throw new Error('一次最多打开 12 个窗口。');
  return valid;
}

async function refreshSessions() {
  if (!isExtension) return;
  const result = await chrome.runtime.sendMessage({ type: 'list-player-windows' });
  if (!result.ok) { show(result.error, true); return; }
  const list = document.querySelector('#session-list');
  const sessions = result.sessions;
  document.querySelector('#session-count').textContent = sessions.length ? `${sessions.length} 个窗口` : '暂无窗口';
  list.replaceChildren();
  if (!sessions.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-list';
    empty.textContent = '尚未打开视频网页。';
    list.append(empty);
    return;
  }
  sessions.forEach(session => {
    const item = document.createElement('li');
    item.className = 'session-item';
    const url = document.createElement('span');
    url.className = 'session-url';
    url.textContent = session.title || session.url;
    url.title = session.url;
    const remove = document.createElement('button');
    remove.className = 'remove-session';
    remove.textContent = '关闭';
    remove.addEventListener('click', async () => {
      const closeResult = await chrome.runtime.sendMessage({ type: 'close-player-window', windowId: session.windowId });
      if (!closeResult.ok) show(closeResult.error, true);
      await refreshSessions();
    });
    item.append(url, remove);
    list.append(item);
  });
}

async function refreshPlaylist() {
  if (!isExtension) return [];
  const result = await chrome.runtime.sendMessage({ type: 'get-playlist' });
  if (!result.ok) { show(result.error, true); return []; }
  const list = document.querySelector('#playlist-list');
  list.replaceChildren();
  if (!result.items.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-list';
    empty.textContent = '右键网页或链接即可加入。';
    list.append(empty);
    return [];
  }
  result.items.forEach(item => {
    const row = document.createElement('li');
    row.className = 'session-item';
    const title = document.createElement('span');
    title.className = 'session-url';
    title.textContent = item.title || item.url;
    title.title = item.url;
    const remove = document.createElement('button');
    remove.className = 'remove-session';
    remove.textContent = '移除';
    remove.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ type: 'remove-playlist-item', url: item.url });
      await refreshPlaylist();
    });
    row.append(title, remove);
    list.append(row);
  });
  return result.items;
}

async function controlAll(action, value) {
  const result = await chrome.runtime.sendMessage({ type: 'control-player-windows', action, value });
  if (!result.ok) { show(result.error, true); return; }
  if (!result.controlled) { show('还没有可控制的独立播放器窗口。', true); return; }
  if (!result.found) { show('当前网页还未找到可控制的视频。请等待页面开始显示播放器后重试。', true); return; }
  const label = action === 'play' ? '已向所有窗口发送播放命令。' : action === 'pause' ? '已向所有窗口发送暂停命令。' : '已按比例同步进度。';
  show(label);
}

async function launchUrls(urls) {
  openButton.disabled = true;
  show('正在打开网页窗口…');
  try {
    const result = await chrome.runtime.sendMessage({ type: 'open-player-windows', urls });
    if (!result.ok) throw new Error(result.error);
    show(`已打开 ${result.opened} 个独立播放器窗口。`);
    await refreshSessions();
    return true;
  } catch (error) {
    show(error.message || '无法打开窗口。', true);
    return false;
  } finally {
    openButton.disabled = false;
  }
}

function renderImportTabs() {
  const list = document.querySelector('#import-list');
  list.replaceChildren();
  document.querySelector('#import-count').textContent = `${importableTabs.length} 个`;
  importableTabs.forEach(tab => {
    const row = document.createElement('label');
    row.className = 'import-row';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = String(tab.id);
    checkbox.checked = true;
    const copy = document.createElement('span');
    copy.style.minWidth = '0';
    const title = document.createElement('span');
    title.className = 'import-title';
    title.textContent = tab.title;
    const url = document.createElement('span');
    url.className = 'import-url';
    url.textContent = tab.url;
    copy.append(title, url);
    row.append(checkbox, copy);
    list.append(row);
  });
}

document.querySelector('#open-windows').addEventListener('click', async () => {
  if (!isExtension) return;
  try {
    const urls = parseUrls();
    await chrome.storage.local.set({ recentUrls: urlsInput.value });
    await launchUrls(urls);
  } catch (error) {
    show(error.message || '无法打开窗口。', true);
  }
});

document.querySelector('#theater-current').addEventListener('click', async () => {
  if (!isExtension) return;
  const result = await chrome.runtime.sendMessage({ type: 'theater-current-tab' });
  if (!result.ok) { show(result.error, true); return; }
  const states = result.result.map(item => item.result?.status).filter(Boolean);
  show(states.includes('no-media') ? '当前网页暂未找到可见视频。' : '已尝试铺满当前网页播放器。', states.includes('no-media'));
});

document.querySelector('#restore-current').addEventListener('click', async () => {
  if (!isExtension) return;
  const result = await chrome.runtime.sendMessage({ type: 'restore-current-tab' });
  show(result.ok ? '已还原当前网页。' : result.error, !result.ok);
});

document.querySelector('#play-all').addEventListener('click', () => controlAll('play'));
document.querySelector('#pause-all').addEventListener('click', () => controlAll('pause'));
document.querySelector('#master-seek').addEventListener('input', event => {
  document.querySelector('#progress-value').textContent = `${event.target.value}%`;
});
document.querySelector('#master-seek').addEventListener('change', event => controlAll('seek', Number(event.target.value) / 100));
document.querySelector('#refresh-sessions').addEventListener('click', refreshSessions);

document.querySelector('#import-tabs').addEventListener('click', async () => {
  if (!isExtension) return;
  const result = await chrome.runtime.sendMessage({ type: 'get-importable-tabs' });
  if (!result.ok) { show(result.error, true); return; }
  importableTabs = result.tabs;
  if (!importableTabs.length) { show('当前浏览器窗口没有可导入的网页标签。', true); return; }
  renderImportTabs();
  document.querySelector('#import-section').hidden = false;
});

document.querySelector('#cancel-import').addEventListener('click', () => {
  document.querySelector('#import-section').hidden = true;
});

document.querySelector('#open-selected').addEventListener('click', async () => {
  const selected = new Set([...document.querySelectorAll('#import-list input:checked')].map(input => Number(input.value)));
  const tabs = importableTabs.filter(tab => selected.has(tab.id));
  if (!tabs.length) { show('请至少勾选一个网页标签。', true); return; }
  show('正在将已打开的网页移入独立窗口…');
  const result = await chrome.runtime.sendMessage({ type: 'move-tabs-to-player-windows', tabIds: tabs.map(tab => tab.id) });
  if (!result.ok) { show(result.error || '无法移动网页标签。', true); return; }
  show(`已将 ${result.moved} 个已打开网页移入独立窗口。`);
  document.querySelector('#import-section').hidden = true;
  await refreshSessions();
});

document.querySelector('#open-playlist').addEventListener('click', async () => {
  const items = await refreshPlaylist();
  if (!items.length) { show('播放列表还是空的。', true); return; }
  const urls = items.slice(0, 12).map(item => item.url);
  if (items.length > 12) show('播放列表超过 12 条，本次先打开前 12 条。');
  await launchUrls(urls);
});

document.querySelector('#clear-playlist').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'clear-playlist' });
  await refreshPlaylist();
});

document.querySelector('#toggle-floating-controls').addEventListener('click', async () => {
  const result = await chrome.runtime.sendMessage({ type: 'set-floating-controls-visible', visible: !floatingControlsVisible });
  if (!result.ok) { show(result.error, true); return; }
  floatingControlsVisible = result.visible;
  updateFloatingControlsButton();
  show(floatingControlsVisible ? '已显示所有窗口的悬浮控制条。' : '已隐藏所有窗口的悬浮控制条。');
});

document.querySelector('#show-player-grid').addEventListener('click', async () => {
  const result = await chrome.runtime.sendMessage({ type: 'show-player-grid' });
  if (!result.ok) { show(result.error, true); return; }
  if (!result.shown) { show('还没有独立播放窗口。', true); return; }
  show(`已显示 ${result.shown} 个独立播放窗口。`);
});

document.querySelector('#close-all-windows').addEventListener('click', async () => {
  const list = await chrome.runtime.sendMessage({ type: 'list-player-windows' });
  const count = list?.sessions?.length || 0;
  if (!count) { show('还没有可关闭的独立播放器窗口。', true); return; }
  if (!window.confirm(`确定要关闭全部 ${count} 个独立播放器窗口吗？`)) return;
  const result = await chrome.runtime.sendMessage({ type: 'close-all-player-windows' });
  if (!result.ok) { show(result.error, true); return; }
  show(`已关闭 ${result.closed} 个独立播放器窗口。`);
  await refreshSessions();
});

if (isExtension) {
  chrome.storage.local.get('floatingControlsVisible').then(({ floatingControlsVisible: saved }) => {
    floatingControlsVisible = saved ?? true;
    updateFloatingControlsButton();
  });
  refreshSessions();
  refreshPlaylist();
}

// 作为控制中心的 iframe 内嵌时，把内容实际高度同步给外层，避免外层写死高度
// 导致内容被裁切、出现双重滚动条。MV3 的 CSP 是 script-src 'self'，
// 这段逻辑必须放在外部文件里，不能写成内联 script。
if (window.parent !== window) {
  const notifyHeight = () => {
    // 用 main 的实际高度而非 body.scrollHeight：body 会被 iframe 视口拉伸，
    // 内容比视口矮时 scrollHeight 会返回视口高度，导致外层多出一截空白。
    const main = document.querySelector('main');
    const height = Math.ceil(main ? main.getBoundingClientRect().height : document.body.scrollHeight);
    window.parent.postMessage({ type: 'player-dashboard-resize', height }, '*');
  };
  if (window.ResizeObserver) new ResizeObserver(notifyHeight).observe(document.body);
  window.addEventListener('load', notifyHeight);
  notifyHeight();
}
