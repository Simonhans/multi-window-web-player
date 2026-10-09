chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'open-player-windows') {
    openPlayerWindows(message.urls)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'move-tabs-to-player-windows') {
    moveTabsToPlayerWindows(message.tabIds)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'theater-current-tab') {
    getFloatingControlsVisible().then(visible => runInCurrentTab(startTheaterMode, [visible]))
      .then(result => sendResponse({ ok: true, result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'restore-current-tab') {
    runInCurrentTab(stopTheaterMode)
      .then(result => sendResponse({ ok: true, result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'list-player-windows') {
    getPlayerSessions()
      .then(sessions => sendResponse({ ok: true, sessions }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'control-player-windows') {
    controlPlayerWindows(message.action, message.value)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'close-player-window') {
    closePlayerWindow(message.windowId)
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'get-importable-tabs') {
    getImportableTabs()
      .then(tabs => sendResponse({ ok: true, tabs }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'get-playlist') {
    getPlaylist().then(items => sendResponse({ ok: true, items }));
    return true;
  }

  if (message.type === 'remove-playlist-item') {
    removePlaylistItem(message.url).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'clear-playlist') {
    chrome.storage.local.set({ playlist: [] }).then(() => updatePlaylistBadge(0)).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'set-floating-controls-visible') {
    setFloatingControlsVisible(Boolean(message.visible))
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'show-player-grid') {
    showPlayerGrid()
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

chrome.action.onClicked.addListener(openDashboard);
chrome.commands.onCommand.addListener(command => {
  if (command === 'open-dashboard') toggleDashboardAndGrid();
});
chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const url = info.menuItemId === 'add-link-to-playlist' ? info.linkUrl : tab?.url;
  const title = info.menuItemId === 'add-link-to-playlist' ? info.linkText || info.linkUrl : tab?.title || tab?.url;
  if (url && /^https?:\/\//i.test(url)) addToPlaylist(url, title);
});

async function openDashboard() {
  const dashboardUrl = chrome.runtime.getURL('dashboard.html');
  const [existing] = await chrome.tabs.query({ url: dashboardUrl });
  if (existing?.id) {
    await chrome.tabs.update(existing.id, { active: true });
    if (existing.windowId) await chrome.windows.update(existing.windowId, { focused: true });
    return;
  }
  await chrome.tabs.create({ url: dashboardUrl, active: true });
}

async function toggleDashboardAndGrid() {
  const dashboardUrl = chrome.runtime.getURL('dashboard.html');
  const [dashboard] = await chrome.tabs.query({ url: dashboardUrl });
  const currentWindow = await chrome.windows.getLastFocused();
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (dashboard?.id && dashboard.windowId === currentWindow?.id && activeTab?.id === dashboard.id) {
    await showPlayerGrid();
    return;
  }
  await openDashboard();
}

async function getImportableTabs() {
  const window = await chrome.windows.getLastFocused({ populate: true });
  const extensionRoot = chrome.runtime.getURL('');
  return (window.tabs || []).filter(tab => {
    return Boolean(tab.url) && /^https?:\/\//i.test(tab.url) && !tab.url.startsWith(extensionRoot);
  }).map(tab => ({ id: tab.id, title: tab.title || tab.url, url: tab.url, active: tab.active }));
}

async function createContextMenus() {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({ id: 'add-page-to-playlist', title: '将当前页面加入多窗口播放列表', contexts: ['page'] });
  chrome.contextMenus.create({ id: 'add-link-to-playlist', title: '将此链接加入多窗口播放列表', contexts: ['link'] });
  updatePlaylistBadge((await getPlaylist()).length);
}

async function getPlaylist() {
  const { playlist = [] } = await chrome.storage.local.get('playlist');
  return playlist;
}

async function addToPlaylist(url, title) {
  const playlist = await getPlaylist();
  if (!playlist.some(item => item.url === url)) {
    playlist.push({ url, title, addedAt: Date.now() });
    await chrome.storage.local.set({ playlist });
  }
  await updatePlaylistBadge(playlist.length);
}

async function removePlaylistItem(url) {
  const playlist = (await getPlaylist()).filter(item => item.url !== url);
  await chrome.storage.local.set({ playlist });
  await updatePlaylistBadge(playlist.length);
}

function updatePlaylistBadge(count) {
  return chrome.action.setBadgeText({ text: count ? String(Math.min(count, 99)) : '' });
}

async function openPlayerWindows(urls) {
  const opened = [];
  const newSessions = [];
  const floatingControlsVisible = await getFloatingControlsVisible();

  for (let index = 0; index < urls.length; index += 1) {
    const windowInfo = await chrome.windows.create({
      url: urls[index],
      type: 'popup',
      focused: false,
      width: 700,
      height: 500
    });
    const tab = windowInfo.tabs?.[0];
    if (tab?.id) {
      await waitForTabLoad(tab.id);
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          func: startTheaterMode,
          args: [floatingControlsVisible]
        });
      } catch (_) {
        // 页面可能仍在加载，或浏览器不允许向该页面注入脚本。
      }
    }
    opened.push(windowInfo.id);
    newSessions.push({ tabId: tab?.id, windowId: windowInfo.id, url: urls[index] });
  }
  const existing = await getPlayerSessions();
  const sessions = [...existing, ...newSessions].filter(session => session.tabId);
  await chrome.storage.local.set({ playerSessions: sessions });
  await arrangePlayerWindows(sessions);
  return { opened: opened.length };
}

async function moveTabsToPlayerWindows(tabIds) {
  const floatingControlsVisible = await getFloatingControlsVisible();
  const newSessions = [];
  for (const tabId of [...new Set(tabIds)]) {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || !/^https?:\/\//i.test(tab.url)) continue;
    const windowInfo = await chrome.windows.create({ tabId, type: 'popup', focused: false });
    const movedTab = windowInfo.tabs?.[0];
    if (movedTab?.id) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: movedTab.id, allFrames: true },
          func: startTheaterMode,
          args: [floatingControlsVisible]
        });
      } catch (_) {
        // 受保护页面或播放器框架可能拒绝注入，标签本身仍已成功移动。
      }
      newSessions.push({ tabId: movedTab.id, windowId: windowInfo.id, url: movedTab.url || tab.url });
    }
  }
  const existing = await getPlayerSessions();
  const sessions = [...existing, ...newSessions];
  await chrome.storage.local.set({ playerSessions: sessions });
  await arrangePlayerWindows(sessions);
  return { moved: newSessions.length };
}

async function arrangePlayerWindows(sessions) {
  if (!sessions.length) return;
  const displays = await chrome.system.display.getInfo();
  const area = (displays.find(item => item.isPrimary) || displays[0]).workArea;
  const columns = Math.ceil(Math.sqrt(sessions.length));
  const rows = Math.ceil(sessions.length / columns);
  await Promise.allSettled(sessions.map((session, index) => chrome.windows.update(session.windowId, {
    state: 'normal',
    left: area.left + Math.floor((index % columns) * area.width / columns),
    top: area.top + Math.floor(Math.floor(index / columns) * area.height / rows),
    width: Math.floor(((index % columns) + 1) * area.width / columns) - Math.floor((index % columns) * area.width / columns),
    height: Math.floor((Math.floor(index / columns) + 1) * area.height / rows) - Math.floor(Math.floor(index / columns) * area.height / rows),
    focused: index === sessions.length - 1
  })));
}

async function showPlayerGrid() {
  const sessions = await getPlayerSessions();
  if (!sessions.length) return { shown: 0 };
  const currentWindow = await chrome.windows.getLastFocused();
  const playerWindowIds = new Set(sessions.map(session => session.windowId));
  if (currentWindow?.id && !playerWindowIds.has(currentWindow.id)) {
    await chrome.windows.update(currentWindow.id, { state: 'minimized' }).catch(() => {});
  }
  await arrangePlayerWindows(sessions);
  const finalWindow = sessions.at(-1)?.windowId;
  if (finalWindow) await chrome.windows.update(finalWindow, { focused: true });
  return { shown: sessions.length };
}

async function getPlayerSessions() {
  const { playerSessions = [] } = await chrome.storage.local.get('playerSessions');
  const checks = await Promise.all(playerSessions.map(async session => {
    try {
      const tab = await chrome.tabs.get(session.tabId);
      return { ...session, url: tab.url || session.url, title: tab.title || '' };
    } catch (_) {
      return null;
    }
  }));
  const sessions = checks.filter(Boolean);
  if (sessions.length !== playerSessions.length) await chrome.storage.local.set({ playerSessions: sessions });
  return sessions;
}

async function getFloatingControlsVisible() {
  const { floatingControlsVisible = true } = await chrome.storage.local.get('floatingControlsVisible');
  return floatingControlsVisible;
}

async function setFloatingControlsVisible(visible) {
  await chrome.storage.local.set({ floatingControlsVisible: visible });
  const sessions = await getPlayerSessions();
  await Promise.allSettled(sessions.map(session => chrome.scripting.executeScript({
    target: { tabId: session.tabId, allFrames: true },
    func: startTheaterMode,
    args: [visible]
  })));
  return { visible };
}

async function closePlayerWindow(windowId) {
  await chrome.windows.remove(windowId);
  const sessions = await getPlayerSessions();
  await chrome.storage.local.set({ playerSessions: sessions.filter(session => session.windowId !== windowId) });
}

async function controlPlayerWindows(action, value) {
  const sessions = await getPlayerSessions();
  if (!sessions.length) return { controlled: 0 };
  let outcomes = await sendControl(sessions, action, value);
  let found = countFound(outcomes);
  if (!found) {
    await new Promise(resolve => setTimeout(resolve, 900));
    outcomes = await sendControl(sessions, action, value);
    found = countFound(outcomes);
  }
  return { controlled: sessions.length, found };
}

function sendControl(sessions, action, value) {
  return Promise.allSettled(sessions.map(session => chrome.scripting.executeScript({
    target: { tabId: session.tabId, allFrames: true },
    func: controlPageVideo,
    args: [action, value]
  })));
}

function countFound(outcomes) {
  return outcomes.reduce((count, outcome) => {
    if (outcome.status !== 'fulfilled') return count;
    return count + outcome.value.filter(frame => frame.result?.found).length;
  }, 0);
}

async function runInCurrentTab(func, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('没有找到当前网页标签。');
  return chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, func, args });
}

function waitForTabLoad(tabId, timeout = 12000) {
  return new Promise(resolve => {
    const timer = setTimeout(done, timeout);
    const listener = (changedTabId, info) => {
      if (changedTabId === tabId && info.status === 'complete') done();
    };
    function done() {
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// 此函数会被 Chrome 序列化到目标网页中，不能引用扩展环境的变量。
function startTheaterMode(showFloatingControls = true) {
  const stateKey = '__multiWindowWebPlayerState__';
  if (window[stateKey]?.active) {
    const currentVideo = [...document.querySelectorAll('video')].filter(video => {
      const rect = video.getBoundingClientRect();
      return rect.width > 32 && rect.height > 32;
    }).sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return br.width * br.height - ar.width * ar.height;
    })[0];
    const existingControls = document.querySelector('[data-multi-player-controls]');
    if (existingControls) existingControls.style.setProperty('display', showFloatingControls ? 'flex' : 'none', 'important');
    else if (currentVideo && showFloatingControls) installPlaybackControls(currentVideo, window[stateKey]);
    return { status: 'already-active' };
  }

  const isVisible = element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width >= 80 && rect.height >= 45;
  };
  const media = [...document.querySelectorAll('video')].filter(isVisible).sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return br.width * br.height - ar.width * ar.height;
  });
  const video = media[0];

  if (!video) {
    const frame = [...document.querySelectorAll('iframe')].filter(isVisible).sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return br.width * br.height - ar.width * ar.height;
    })[0];
    if (frame) {
      const saved = new Map();
      const save = element => { if (!saved.has(element)) saved.set(element, element.getAttribute('style')); };
      save(frame); save(document.documentElement); save(document.body);
      const css = (element, property, value) => element.style.setProperty(property, value, 'important');
      ['position:fixed', 'inset:0', 'width:100vw', 'height:100vh', 'max-width:none', 'max-height:none', 'border:0', 'margin:0', 'padding:0', 'z-index:2147483646', 'background:#000'].forEach(rule => {
        const [property, value] = rule.split(':'); css(frame, property, value);
      });
      css(document.documentElement, 'overflow', 'hidden');
      css(document.body, 'overflow', 'hidden');
      window[stateKey] = { active: true, saved, cleanup: [] };
      installExitButton(window[stateKey]);
      return { status: 'iframe-expanded' };
    }
    return { status: 'no-media' };
  }

  const videoRect = video.getBoundingClientRect();
  const videoArea = Math.max(1, videoRect.width * videoRect.height);
  let box = video.parentElement || video;
  let cursor = video.parentElement;
  let depth = 0;
  while (cursor && cursor !== document.body && depth < 12) {
    const rect = cursor.getBoundingClientRect();
    const ratio = rect.width * rect.height / videoArea;
    const marker = `${cursor.id} ${typeof cursor.className === 'string' ? cursor.className : ''}`;
    const playerLike = /player|video|media|vjs|art-|dplayer|plyr/i.test(marker);
    if (rect.width >= videoRect.width * .82 && rect.height >= videoRect.height && ratio <= 2.6) box = cursor;
    if (playerLike && ratio <= 4.4 && rect.width >= videoRect.width * .75) box = cursor;
    if (ratio > 5.5 || rect.width > innerWidth * .98 && rect.height > innerHeight * .9) break;
    cursor = cursor.parentElement;
    depth += 1;
  }

  const saved = new Map();
  const save = element => { if (element && !saved.has(element)) saved.set(element, element.getAttribute('style')); };
  const css = (element, property, value) => { save(element); element.style.setProperty(property, value, 'important'); };
  const chain = [];
  cursor = video;
  while (cursor && cursor !== box.parentElement) {
    chain.push(cursor);
    if (cursor === box) break;
    cursor = cursor.parentElement;
  }
  for (const element of chain) {
    if (element !== box) {
      css(element, 'width', '100%'); css(element, 'height', '100%');
      css(element, 'max-width', 'none'); css(element, 'max-height', 'none');
      css(element, 'min-width', '0'); css(element, 'min-height', '0');
      css(element, 'transform', 'none');
    }
  }
  cursor = box.parentElement;
  while (cursor && cursor !== document.documentElement) {
    const style = getComputedStyle(cursor);
    if (style.transform !== 'none') css(cursor, 'transform', 'none');
    if (style.filter !== 'none') css(cursor, 'filter', 'none');
    if (style.contain !== 'none') css(cursor, 'contain', 'none');
    cursor = cursor.parentElement;
  }
  css(video, 'object-fit', 'contain'); css(video, 'background', '#000');
  css(box, 'position', 'fixed'); css(box, 'inset', '0'); css(box, 'width', '100vw'); css(box, 'height', '100vh');
  css(box, 'max-width', 'none'); css(box, 'max-height', 'none'); css(box, 'margin', '0'); css(box, 'padding', '0');
  css(box, 'transform', 'none'); css(box, 'z-index', '2147483646'); css(box, 'overflow', 'hidden'); css(box, 'background', '#000');
  css(document.documentElement, 'overflow', 'hidden'); css(document.body, 'overflow', 'hidden');
  const state = { active: true, saved, cleanup: [] };
  window[stateKey] = state;
  installExitButton(state);
  installPlaybackControls(video, state);
  video.play().catch(() => {});
  return { status: 'video-expanded', tag: box.tagName };

  function installExitButton(currentState) {
    const button = document.createElement('button');
    button.textContent = '退出铺满  Esc';
    button.type = 'button';
    button.setAttribute('aria-label', '退出播放器铺满模式');
    button.style.cssText = 'position:fixed!important;top:12px!important;right:12px!important;z-index:2147483647!important;border:1px solid #ffffff55!important;border-radius:6px!important;background:#151515dd!important;color:#fff!important;padding:8px 10px!important;font:12px system-ui!important;cursor:pointer!important;opacity:.15!important;transition:opacity .15s!important';
    button.addEventListener('mouseenter', () => { button.style.opacity = '1'; });
    button.addEventListener('mouseleave', () => { button.style.opacity = '.15'; });
    button.addEventListener('click', () => window.__multiWindowWebPlayerRestore__?.());
    document.body.append(button);
    const onKey = event => { if (event.key === 'Escape') window.__multiWindowWebPlayerRestore__?.(); };
    document.addEventListener('keydown', onKey, true);
    currentState.cleanup.push(() => button.remove(), () => document.removeEventListener('keydown', onKey, true));
    window.__multiWindowWebPlayerRestore__ = () => {
      currentState.saved.forEach((style, element) => style === null ? element.removeAttribute('style') : element.setAttribute('style', style));
      currentState.cleanup.forEach(cleanup => cleanup());
      delete window.__multiWindowWebPlayerState__;
      delete window.__multiWindowWebPlayerRestore__;
    };
  }

  function installPlaybackControls(currentVideo, currentState) {
    const bar = document.createElement('div');
    bar.setAttribute('data-multi-player-controls', 'true');
    bar.title = '按住 Ctrl 再操作，可同步控制全部独立窗口';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', '视频播放控制');
    bar.style.cssText = 'position:fixed!important;left:50%!important;bottom:18px!important;z-index:2147483647!important;display:flex!important;align-items:center!important;gap:9px!important;width:min(620px,calc(100vw - 34px))!important;padding:9px 11px!important;border:1px solid #ffffff3b!important;border-radius:9px!important;background:#121212e8!important;box-shadow:0 8px 30px #000a!important;backdrop-filter:blur(10px)!important;transform:translateX(-50%)!important;opacity:.22!important;transition:opacity .18s!important';
    if (!showFloatingControls) bar.style.setProperty('display', 'none', 'important');
    const makeButton = (text, label) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = text; button.setAttribute('aria-label', label);
      button.style.cssText = 'min-width:29px!important;height:29px!important;padding:0 7px!important;border:0!important;border-radius:5px!important;background:#2b2d31!important;color:#f5f5f5!important;font:13px system-ui!important;cursor:pointer!important';
      return button;
    };
    const back = makeButton('−10', '后退 10 秒');
    const toggle = makeButton('▶', '播放');
    const forward = makeButton('+10', '前进 10 秒');
    const current = document.createElement('span');
    const total = document.createElement('span');
    const range = document.createElement('input');
    const mute = makeButton('◖', '静音切换');
    range.type = 'range'; range.min = '0'; range.max = '1000'; range.value = '0';
    range.setAttribute('aria-label', '视频进度');
    range.style.cssText = 'flex:1!important;min-width:50px!important;accent-color:#b7ee6a!important;cursor:pointer!important';
    [current, total].forEach(item => item.style.cssText = 'color:#e0e2e3!important;font:10px ui-monospace,Consolas,monospace!important;white-space:nowrap!important');
    const separator = document.createElement('span'); separator.textContent = '/'; separator.style.cssText = 'color:#83878c!important;font-size:10px!important;margin:-6px!important';
    bar.append(back, toggle, forward, current, separator, total, range, mute);
    document.body.append(bar);
    const format = seconds => {
      if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
      const rounded = Math.floor(seconds);
      return `${String(Math.floor(rounded / 60)).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`;
    };
    const refresh = () => {
      current.textContent = format(currentVideo.currentTime);
      total.textContent = format(currentVideo.duration);
      if (Number.isFinite(currentVideo.duration) && currentVideo.duration > 0) range.value = String(Math.round(currentVideo.currentTime / currentVideo.duration * 1000));
      toggle.textContent = currentVideo.paused ? '▶' : 'Ⅱ';
      toggle.setAttribute('aria-label', currentVideo.paused ? '播放' : '暂停');
      mute.textContent = currentVideo.muted ? '◖̸' : '◖';
    };
    const seek = seconds => {
      if (Number.isFinite(currentVideo.duration)) currentVideo.currentTime = Math.max(0, Math.min(currentVideo.duration, currentVideo.currentTime + seconds));
    };
    const applyToAll = (event, action, value) => {
      if (!event.ctrlKey || typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return false;
      chrome.runtime.sendMessage({ type: 'control-player-windows', action, value }).catch(() => {});
      return true;
    };
    back.addEventListener('click', event => { if (!applyToAll(event, 'skip', -10)) seek(-10); });
    forward.addEventListener('click', event => { if (!applyToAll(event, 'skip', 10)) seek(10); });
    toggle.addEventListener('click', event => {
      const action = currentVideo.paused ? 'play' : 'pause';
      if (!applyToAll(event, action)) currentVideo.paused ? currentVideo.play().catch(() => {}) : currentVideo.pause();
    });
    mute.addEventListener('click', event => {
      if (!applyToAll(event, 'toggle-muted')) { currentVideo.muted = !currentVideo.muted; refresh(); }
    });
    range.addEventListener('input', event => {
      const fraction = Number(range.value) / 1000;
      if (!applyToAll(event, 'seek', fraction) && Number.isFinite(currentVideo.duration)) currentVideo.currentTime = fraction * currentVideo.duration;
    });
    const reveal = () => { bar.style.opacity = '1'; };
    const dim = () => { if (!bar.matches(':hover')) bar.style.opacity = '.22'; };
    bar.addEventListener('mouseenter', reveal); bar.addEventListener('mouseleave', dim);
    document.addEventListener('mousemove', reveal, { passive: true });
    const events = ['timeupdate', 'loadedmetadata', 'durationchange', 'play', 'pause', 'volumechange'];
    events.forEach(event => currentVideo.addEventListener(event, refresh));
    refresh();
    currentState.cleanup.push(
      () => bar.remove(),
      () => events.forEach(event => currentVideo.removeEventListener(event, refresh)),
      () => document.removeEventListener('mousemove', reveal)
    );
  }
}

function stopTheaterMode() {
  if (!window.__multiWindowWebPlayerRestore__) return { status: 'not-active' };
  window.__multiWindowWebPlayerRestore__();
  return { status: 'restored' };
}

// 此函数同样会被序列化到每个目标网页，依靠浏览器原生 <video> API 控制播放。
async function controlPageVideo(action, value) {
  const visibleVideos = [...document.querySelectorAll('video')].filter(video => {
    const style = getComputedStyle(video);
    const rect = video.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 32 && rect.height > 32;
  }).sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return br.width * br.height - ar.width * ar.height;
  });
  const video = visibleVideos[0];
  if (!video) return { found: false };
  let error = '';
  if (action === 'play') {
    try { await video.play(); } catch (reason) { error = reason?.name || 'play-rejected'; }
  }
  if (action === 'pause') video.pause();
  if (action === 'skip' && Number.isFinite(Number(value)) && Number.isFinite(video.duration)) {
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + Number(value)));
  }
  if (action === 'toggle-muted') video.muted = !video.muted;
  if (action === 'seek' && Number.isFinite(Number(value)) && Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = Math.max(0, Math.min(1, Number(value))) * video.duration;
  }
  return { found: true, paused: video.paused, currentTime: video.currentTime, duration: video.duration, error };
}
