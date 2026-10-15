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

  if (message.type === 'restore-player-tabs') {
    restorePlayerTabsToBrowser()
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'list-player-windows') {
    Promise.all([getPlayerSessions(), getMainKey()])
      .then(([sessions, mainKey]) => sendResponse({
        ok: true,
        mainKey,
        sessions: sessions.map(session => ({
          ...session,
          isMain: Boolean(mainKey) && normalizeVideoUrl(session.url) === mainKey
        }))
      }))
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

  if (message.type === 'close-all-player-windows') {
    closeAllPlayerWindows()
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'get-bookmarks') {
    getBookmarks(message.url)
      .then(items => sendResponse({ ok: true, items }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'add-bookmark') {
    addBookmark(message.url, message.title, message.time, message.duration, message.note)
      .then(item => sendResponse({ ok: true, item }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-bookmark-note') {
    setBookmarkNote(message.id, message.note)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'remove-bookmark') {
    removeBookmark(message.id)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'list-all-bookmarks') {
    listAllBookmarks()
      .then(groups => sendResponse({ ok: true, groups }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'clear-bookmarks') {
    chrome.storage.local.set({ bookmarks: {} })
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'import-bookmarks') {
    importBookmarks(message.groups)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'jump-bookmark') {
    jumpToBookmark(message.key, message.time, message.duration, message.url)
      .then(result => sendResponse({ ok: true, ...result }))
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

  if (message.type === 'get-layout-mode') {
    Promise.all([getLayoutMode(), getFocusRatio(), getMainKey()])
      .then(([mode, ratio, mainKey]) => sendResponse({ ok: true, mode, ratio, mainKey }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-layout-mode') {
    setLayoutMode(message.mode)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-focus-ratio') {
    setFocusRatio(message.ratio)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-main-window') {
    setMainWindow(message.windowId)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-floating-controls-visible') {
    setFloatingControlsVisible(Boolean(message.visible))
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-auto-hide-controls') {
    setAutoHideControls(Boolean(message.autoHide))
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-preview-on-hover') {
    setPreviewOnHover(Boolean(message.preview))
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'get-toggle-shortcut') {
    getToggleShortcut()
      .then(shortcut => sendResponse({ ok: true, shortcut }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'set-toggle-shortcut') {
    setToggleShortcut(message.shortcut)
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'toggle-dashboard-grid') {
    toggleDashboardAndGrid()
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
    if (existing.windowId) {
      // 只对「确实处于最小化」的窗口做恢复，而且恢复成它被最小化之前的状态。
      // 之前是无条件 update 成 state:'normal'，而 normal 的含义是「既不最小化也不最大化」，
      // 于是原本最大化的浏览器窗口会被降级、缩回它记忆里的小尺寸（表现为缩到屏幕一角）。
      const win = await chrome.windows.get(existing.windowId).catch(() => null);
      if (win && win.state === 'minimized') {
        const previous = await recallDashboardWindowState(existing.windowId);
        await chrome.windows.update(existing.windowId, {
          state: previous === 'maximized' ? 'maximized' : 'normal'
        }).catch(() => {});
      }
      await chrome.windows.update(existing.windowId, { focused: true }).catch(() => {});
    }
    return;
  }
  await chrome.tabs.create({ url: dashboardUrl, active: true });
}

let lastToggleAt = 0;
async function toggleDashboardAndGrid() {
  // 浏览器级快捷键（manifest 里的 commands）和页面内自定义快捷键可能同时命中同一次按键
  // —— 取决于 Chrome 有没有把按键吞掉。400ms 内的重复调用当作同一次，避免连切两下。
  const now = Date.now();
  if (now - lastToggleAt < 400) return { skipped: true };
  lastToggleAt = now;
  const dashboardUrl = chrome.runtime.getURL('dashboard.html');
  const [dashboard] = await chrome.tabs.query({ url: dashboardUrl });
  const currentWindow = await chrome.windows.getLastFocused();
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (dashboard?.id && dashboard.windowId === currentWindow?.id && activeTab?.id === dashboard.id) {
    await showPlayerGrid();
    return { view: 'grid' };
  }
  await openDashboard();
  return { view: 'dashboard' };
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
  const theaterOptions = await getTheaterOptions();
  // 创建窗口之前记下前台窗口（= 调用方）。创建过程会扰动焦点，结束时再取就不可靠了。
  const callerId = await currentForegroundWindowId();

  // 批量打开 = 「我要看的就是这一批」：先把已存在的播放窗口全部关掉。
  // 不清的话残留窗口会参与均分 —— 残留 2 个 + 新开 3 个就按 5 窗均分（每个 646×526），
  // 关掉旧的再点「返回播放网格」又变成 3 窗均分（966×526），两次的大小布局对不上。
  // 书签按网址保存在本地，不随窗口关闭丢失。
  await closeAllPlayerWindows();

  // ——— 核心改动：先算好目标布局，创建窗口时直接用最终位置和尺寸 ———
  // 之前是先全部创建成 700×500，再调 arrangePlayerWindows 改位置。
  // 但 Windows 的窗口管理器对刚创建的 popup 窗口做 update 不一定能可靠生效
  // （系统内部初始化和 update 存在竞争），导致「第一次打开」的大小与
  // 「返回播放网格」不一致。现在直接用目标矩形创建，彻底避免 create → update 竞争。
  const displays = await chrome.system.display.getInfo();
  const area = (displays.find(d => d.isPrimary) || displays[0]).workArea;
  const layoutMode = await getLayoutMode();
  const ratio = await getFocusRatio();
  const rects = expandForOverlap(
    computeLayout(layoutMode, urls.length, area, ratio), area);

  for (let i = 0; i < urls.length; i++) {
    const rect = rects[i];
    const windowInfo = await chrome.windows.create({
      url: urls[i],
      type: 'popup',
      focused: false,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
    const tab = windowInfo.tabs?.[0];
    opened.push(windowInfo.id);
    if (tab?.id) newSessions.push({ tabId: tab.id, windowId: windowInfo.id, url: urls[i] });
  }
  const existing = await getPlayerSessions();
  const sessions = [...existing, ...newSessions].filter(session => session.tabId);
  await chrome.storage.local.set({ playerSessions: sessions });

  // 等 300ms 让所有新窗口完成系统级初始化，然后用 arrangePlayerWindows 做一次
  // 精确矫正（处理 mainKey 排序等逻辑）。窗口已经在目标位置了，这一步只是微调。
  await new Promise(resolve => setTimeout(resolve, 300));
  await arrangePlayerWindows(sessions);

  await stashForegroundWindow(sessions, callerId);
  await raisePlayerWindows(sessions);
  // 窗口已经排好、全部可见了，注入在后台并行等各自的页面加载（总耗时 = 最慢的那个，
  // 而不是串行相加）。注入期间用户看到的就是正确的网格里装着正在加载的页面。
  await Promise.allSettled(newSessions
    .filter(session => session.tabId)
    .map(session => injectTheaterMode(session.tabId, theaterOptions)));
  return { opened: opened.length };
}

async function moveTabsToPlayerWindows(tabIds) {
  const theaterOptions = await getTheaterOptions();
  const callerId = await currentForegroundWindowId();
  const newSessions = [];
  const injected = [];
  // 同 openPlayerWindows：先算好布局、用目标矩形创建窗口，注入放最后并行。
  // 先过滤出有效标签，才能准确算出总数和布局。
  const validTabs = [];
  for (const tabId of [...new Set(tabIds)]) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (tab?.url && /^https?:\/\//i.test(tab.url)) validTabs.push(tab);
  }
  // 已有的播放窗口 + 新增的标签 = 总窗口数，提前算好布局坐标。
  const existing = await getPlayerSessions();
  const totalCount = existing.length + validTabs.length;
  const displays = await chrome.system.display.getInfo();
  const area = (displays.find(d => d.isPrimary) || displays[0]).workArea;
  const layoutMode = await getLayoutMode();
  const ratio = await getFocusRatio();
  const rects = totalCount
    ? expandForOverlap(computeLayout(layoutMode, totalCount, area, ratio), area)
    : [];

  for (let i = 0; i < validTabs.length; i++) {
    const tab = validTabs[i];
    const rectIndex = existing.length + i;
    const rect = rects[rectIndex] || {};
    const createOpts = { tabId: tab.id, type: 'popup', focused: false };
    if (rect.left != null) Object.assign(createOpts, rect);
    const windowInfo = await chrome.windows.create(createOpts);
    const movedTab = windowInfo.tabs?.[0];
    if (movedTab?.id) {
      newSessions.push({ tabId: movedTab.id, windowId: windowInfo.id, url: movedTab.url || tab.url });
      injected.push(movedTab.id);
    }
  }
  const sessions = [...existing, ...newSessions];
  await chrome.storage.local.set({ playerSessions: sessions });

  // 等 300ms 让新窗口稳定，再做一次精确矫正。
  await new Promise(resolve => setTimeout(resolve, 300));
  await arrangePlayerWindows(sessions);

  await stashForegroundWindow(sessions, callerId);
  await raisePlayerWindows(sessions);
  await Promise.allSettled(injected.map(tabId => injectTheaterMode(tabId, theaterOptions)));
  return { moved: newSessions.length };
}

// ---------- 窗口布局 ----------
// 支持四种排布：auto 自动网格 / row 单行横排 / column 单列竖排 / focus 一主多副。
const LAYOUT_MODES = ['auto', 'row', 'column', 'focus'];

// 主副布局里主窗口的宽度占比（百分比）。留上下限，避免滑杆拖到极端把副窗口压没。
const FOCUS_RATIO_MIN = 40;
const FOCUS_RATIO_MAX = 80;
const FOCUS_RATIO_DEFAULT = 62;

async function getLayoutMode() {
  const { layoutMode = 'auto' } = await chrome.storage.local.get('layoutMode');
  return LAYOUT_MODES.includes(layoutMode) ? layoutMode : 'auto';
}

async function getFocusRatio() {
  const { focusRatio } = await chrome.storage.local.get('focusRatio');
  const value = Number(focusRatio);
  if (!Number.isFinite(value)) return FOCUS_RATIO_DEFAULT;
  return Math.min(FOCUS_RATIO_MAX, Math.max(FOCUS_RATIO_MIN, Math.round(value)));
}

async function setFocusRatio(ratio) {
  const value = Math.min(FOCUS_RATIO_MAX, Math.max(FOCUS_RATIO_MIN, Math.round(Number(ratio) || FOCUS_RATIO_DEFAULT)));
  await chrome.storage.local.set({ focusRatio: value });
  const sessions = await getPlayerSessions();
  if (sessions.length) await arrangePlayerWindows(sessions);
  return { ratio: value, count: sessions.length };
}

async function setLayoutMode(mode) {
  if (!LAYOUT_MODES.includes(mode)) throw new Error('未知的布局方式。');
  await chrome.storage.local.set({ layoutMode: mode });
  const sessions = await getPlayerSessions();
  if (sessions.length) await arrangePlayerWindows(sessions, mode);
  return { mode, count: sessions.length, ratio: await getFocusRatio() };
}

// 主窗口用「归一化网址」标识，而不是窗口 id：窗口关掉、下次再打开同一个视频时，
// 主窗口身份能自动恢复；用窗口 id 的话一变就丢了。
async function getMainKey() {
  const { mainKey = '' } = await chrome.storage.local.get('mainKey');
  return mainKey;
}

async function setMainWindow(windowId) {
  const sessions = await getPlayerSessions();
  const target = sessions.find(session => session.windowId === windowId);
  if (!target) throw new Error('该窗口已经关闭了。');
  const key = normalizeVideoUrl(target.url);
  await chrome.storage.local.set({ mainKey: key });
  await arrangePlayerWindows(sessions);
  return { key, title: target.title || target.url };
}

// 把主窗口挪到数组第 1 位（computeLayout 用第 1 个位置画主画面），其余保持原顺序。
// 找不到匹配（没设过、或那个视频已关掉）时原样返回，退化成「先开的当主」。
function withMainFirst(sessions, mainKey) {
  if (!mainKey) return sessions;
  const index = sessions.findIndex(session => normalizeVideoUrl(session.url) === mainKey);
  if (index <= 0) return sessions;
  return [sessions[index], ...sessions.slice(0, index), ...sessions.slice(index + 1)];
}

// 把 count 个窗口按指定方式摊到 area 上。
// 边界统一用 round(i * size / total) 再取差值，保证相邻窗口严丝合缝、不重叠。
function computeLayout(mode, count, area, ratio = FOCUS_RATIO_DEFAULT) {
  const rects = [];
  const edge = (index, total, size) => Math.round(index * size / total);
  const push = (x, y, w, h) => rects.push({
    left: Math.round(area.left + x),
    top: Math.round(area.top + y),
    width: Math.max(1, Math.round(w)),
    height: Math.max(1, Math.round(h))
  });

  if (mode === 'row') {
    for (let i = 0; i < count; i += 1) {
      push(edge(i, count, area.width), 0, edge(i + 1, count, area.width) - edge(i, count, area.width), area.height);
    }
    return rects;
  }

  if (mode === 'column') {
    for (let i = 0; i < count; i += 1) {
      push(0, edge(i, count, area.height), area.width, edge(i + 1, count, area.height) - edge(i, count, area.height));
    }
    return rects;
  }

  if (mode === 'focus') {
    // 第 1 个窗口当主画面，宽度占比由滑杆决定（默认 62%），其余在右侧竖排。
    if (count === 1) { push(0, 0, area.width, area.height); return rects; }
    const mainWidth = edge(ratio, 100, area.width);
    push(0, 0, mainWidth, area.height);
    const side = count - 1;
    for (let i = 0; i < side; i += 1) {
      push(mainWidth, edge(i, side, area.height), area.width - mainWidth,
        edge(i + 1, side, area.height) - edge(i, side, area.height));
    }
    return rects;
  }

  // auto：近似正方形的网格（原有行为）
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  for (let i = 0; i < count; i += 1) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x1 = edge(col, columns, area.width);
    const x2 = edge(col + 1, columns, area.width);
    const y1 = edge(row, rows, area.height);
    const y2 = edge(row + 1, rows, area.height);
    push(x1, y1, x2 - x1, y2 - y1);
  }
  return rects;
}

// 相邻窗口互相压住这么多像素。Windows 上每个窗口都自带 1px 边框和一圈投影，
// 严格贴边时两道边框 + 投影会在接缝处连成一条很显眼的"间隔"；让它们互相压住几像素，
// 上面的窗口就会把下面那个的边框盖掉，接缝只剩一条，视觉上紧贴很多。
// 代价是每个窗口靠内的那一侧会少掉 overlap/2 像素画面。
const WINDOW_OVERLAP = 12;

function expandForOverlap(rects, area) {
  const half = Math.round(WINDOW_OVERLAP / 2);
  return rects.map(rect => {
    const left = Math.max(area.left, rect.left - half);
    const top = Math.max(area.top, rect.top - half);
    const right = Math.min(area.left + area.width, rect.left + rect.width + half);
    const bottom = Math.min(area.top + area.height, rect.top + rect.height + half);
    return { left, top, width: right - left, height: bottom - top };
  });
}

async function arrangePlayerWindows(sessions, mode) {
  if (!sessions.length) return;
  const layout = LAYOUT_MODES.includes(mode) ? mode : await getLayoutMode();
  const ratio = await getFocusRatio();
  const ordered = withMainFirst(sessions, await getMainKey());
  if (ordered !== sessions) {
    sessions = ordered;
    // 顺序变了要落盘，否则控制中心的列表顺序会和实际窗口排布对不上。
    await chrome.storage.local.set({ playerSessions: sessions });
  }
  const displays = await chrome.system.display.getInfo();
  const area = (displays.find(item => item.isPrimary) || displays[0]).workArea;
  const rects = expandForOverlap(computeLayout(layout, sessions.length, area, ratio), area);
  // 逐个顺序更新窗口位置（不用 Promise.all 并行）—— Windows 的窗口管理器在
  // 并行处理多个新创建的 popup 窗口位置更新时可能互相干扰，导致部分窗口的尺寸
  // 没有生效。逐个发更可靠。
  // 同时只在窗口不处于 normal 状态时才带 state:'normal'：对已经是 normal 的窗口
  // 做一次多余的 state 切换可能触发系统的窗口初始化逻辑，覆盖坐标。
  for (let i = 0; i < sessions.length; i++) {
    const win = await chrome.windows.get(sessions[i].windowId).catch(() => null);
    if (!win) continue;
    const props = { ...rects[i] };
    if (win.state !== 'normal') props.state = 'normal';
    // 主窗口（第 1 个）获得焦点
    if (i === 0) props.focused = true;
    await chrome.windows.update(sessions[i].windowId, props).catch(() => {});
  }
}

// 把所有播放窗口依次提到 Z 序最前：每聚焦一个，它就盖到别人上面；
// 主窗口放最后聚焦，保证它成为当前活动窗口。
// 排列（arrangePlayerWindows）只改位置不改 Z 序 —— 副窗口的 update 刻意不带 focused，
// 排列完它们仍压在调用方窗口底下。只把主窗口提上来是不够的，
// 其余窗口会被控制中心整个盖住，看起来就像「只打开了一个窗口」。
// 注意：这里只传 focused:true，不再重复传 state:'normal' ——
// arrangePlayerWindows 已经设置好了精确的 left/top/width/height + state:'normal'，
// 若在这里再发一次不带坐标的 state:'normal'，Windows 会把刚创建的窗口当作
// 「新窗口重新初始化」，导致系统覆盖掉之前精确排列的尺寸和位置，
// 表现为首次打开时窗口大小与「返回播放网格」不一致。
async function raisePlayerWindows(sessions) {
  const ordered = withMainFirst(sessions, await getMainKey());
  for (const session of [...ordered.slice(1), ...ordered.slice(0, 1)]) {
    await chrome.windows.update(session.windowId, { focused: true }).catch(() => {});
  }
}

// 把挡在前面的调用方窗口（控制中心 / 浏览器主窗口）记下状态并最小化让位，
// 这样排列出来的全部播放窗口才真正露得出来。
// callerId：调用方在动手创建窗口**之前**记下的前台窗口 id。创建一堆窗口的过程里
// 焦点可能被 OS 扰动，结束时 getLastFocused 未必还是调用方 —— 所以动手前记、这里优先用记录值。
async function stashForegroundWindow(sessions, callerId) {
  const current = callerId != null
    ? await chrome.windows.get(callerId).catch(() => null)
    : await chrome.windows.getLastFocused().catch(() => null);
  const playerIds = new Set(sessions.map(session => session.windowId));
  if (!current?.id || playerIds.has(current.id)) return;
  // 记下最小化之前的窗口状态，切回控制中心时才能原样恢复（最大化 / 普通）。
  await rememberDashboardWindowState(current.id, current.state);
  await chrome.windows.update(current.id, { state: 'minimized' }).catch(() => {});
}

// 动手创建窗口之前把前台窗口 id 记下来（配合 stashForegroundWindow 用）。
async function currentForegroundWindowId() {
  return chrome.windows.getLastFocused().then(window => window?.id ?? null).catch(() => null);
}

async function showPlayerGrid() {
  const sessions = await getPlayerSessions();
  if (!sessions.length) return { shown: 0 };
  await stashForegroundWindow(sessions);
  await arrangePlayerWindows(sessions);
  await raisePlayerWindows(sessions);
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

// 「返回播放网格」会把控制中心所在窗口最小化。Chrome 的 window.state 只有
// normal / minimized / maximized / fullscreen，窗口一旦最小化就查不到它原本是哪种，
// 所以最小化前先把它记下来，切回控制中心时按记录恢复。
async function rememberDashboardWindowState(windowId, state) {
  if (!windowId || !state || state === 'minimized') return;
  await chrome.storage.local.set({ dashboardWindow: { id: windowId, state } });
}

async function recallDashboardWindowState(windowId) {
  const { dashboardWindow } = await chrome.storage.local.get('dashboardWindow');
  return dashboardWindow && dashboardWindow.id === windowId ? dashboardWindow.state : '';
}

async function setFloatingControlsVisible(visible) {
  await chrome.storage.local.set({ floatingControlsVisible: visible });
  const sessions = await getPlayerSessions();
  const options = { ...(await getTheaterOptions()), visible };
  await Promise.allSettled(sessions.map(session => chrome.scripting.executeScript({
    target: { tabId: session.tabId, allFrames: true },
    func: startTheaterMode,
    args: [options]
  })));
  return { visible };
}

// 播放时是否自动收起悬浮控制条（鼠标移入窗口才出现）。默认开启。
async function getAutoHideControls() {
  const { autoHideControls = true } = await chrome.storage.local.get('autoHideControls');
  return autoHideControls !== false;
}

async function setAutoHideControls(autoHide) {
  const value = autoHide !== false;
  await chrome.storage.local.set({ autoHideControls: value });
  const sessions = await getPlayerSessions();
  const options = { ...(await getTheaterOptions()), autoHide: value };
  await Promise.allSettled(sessions.map(session => chrome.scripting.executeScript({
    target: { tabId: session.tabId, allFrames: true },
    func: startTheaterMode,
    args: [options]
  })));
  return { autoHide: value };
}

// 鼠标悬停在进度条上时是否显示时间与画面预览。默认开启。
// 画面预览要额外解码一路视频（独立 video 元素，不动主视频），
// 流媒体（MSE，src 是 MediaSource 的 blob URL）拿不到帧时会自动降级成只显示时间。
async function getPreviewOnHover() {
  const { previewOnHover = true } = await chrome.storage.local.get('previewOnHover');
  return previewOnHover !== false;
}

async function setPreviewOnHover(preview) {
  const value = preview !== false;
  await chrome.storage.local.set({ previewOnHover: value });
  const sessions = await getPlayerSessions();
  const options = { ...(await getTheaterOptions()), preview: value };
  await Promise.allSettled(sessions.map(session => chrome.scripting.executeScript({
    target: { tabId: session.tabId, allFrames: true },
    func: startTheaterMode,
    args: [options]
  })));
  return { preview: value };
}

// startTheaterMode 的选项总是成组使用，统一取一次避免各调用点写重复代码。
async function getTheaterOptions() {
  return {
    visible: await getFloatingControlsVisible(),
    autoHide: await getAutoHideControls(),
    preview: await getPreviewOnHover(),
    shortcut: await getToggleShortcut()
  };
}

// 控制中心 / 播放网格的切换快捷键。注意：Chrome 的 commands.suggested_key 是 manifest 里写死的，
// 运行时改不了，所以这里维护的是扩展自己在播放窗口和控制中心内监听的快捷键；
// manifest 里那个 Ctrl+Shift+Y 仍然在任意页面可用，用户也可以去 chrome://extensions/shortcuts 改。
const DEFAULT_TOGGLE_SHORTCUT = 'Ctrl+Shift+Y';

async function getToggleShortcut() {
  const { toggleShortcut } = await chrome.storage.local.get('toggleShortcut');
  return typeof toggleShortcut === 'string' && toggleShortcut.trim() ? toggleShortcut.trim() : DEFAULT_TOGGLE_SHORTCUT;
}

async function setToggleShortcut(spec) {
  const value = String(spec || '').trim() || DEFAULT_TOGGLE_SHORTCUT;
  await chrome.storage.local.set({ toggleShortcut: value });
  const sessions = await getPlayerSessions();
  const options = { ...(await getTheaterOptions()), shortcut: value };
  await Promise.allSettled(sessions.map(session => chrome.scripting.executeScript({
    target: { tabId: session.tabId, allFrames: true },
    func: startTheaterMode,
    args: [options]
  })));
  return { shortcut: value };
}

async function closePlayerWindow(windowId) {
  await chrome.windows.remove(windowId);
  const sessions = await getPlayerSessions();
  await chrome.storage.local.set({ playerSessions: sessions.filter(session => session.windowId !== windowId) });
}

// 把独立播放窗口里的视频标签搬回浏览器标签栏，并还原页面原样。
// 和 closeAllPlayerWindows 的区别：那个是直接关掉，这个是把标签留下来。
async function restorePlayerTabsToBrowser() {
  const sessions = await getPlayerSessions();
  if (!sessions.length) return { restored: 0 };

  // 落点优先用控制中心所在的窗口 —— 用户就在那儿点的按钮，标签落回他眼前的窗口最自然。
  const dashboardUrl = chrome.runtime.getURL('dashboard.html');
  const [dashboardTab] = await chrome.tabs.query({ url: dashboardUrl });
  let targetWindowId = dashboardTab?.windowId;
  if (!targetWindowId) {
    const lastFocused = await chrome.windows.getLastFocused().catch(() => null);
    targetWindowId = lastFocused?.id;
  }
  if (!targetWindowId) {
    const created = await chrome.windows.create({ focused: false });
    targetWindowId = created?.id;
  }
  if (!targetWindowId) throw new Error('找不到可以接收标签的浏览器窗口。');

  let restored = 0;
  for (const session of sessions) {
    try {
      // 搬到目标窗口末尾。标签搬走后播放窗口就空了，Chrome 会自行关掉它。
      await chrome.tabs.move(session.tabId, { windowId: targetWindowId, index: -1 });
      restored += 1;
    } catch (_) {
      // 标签可能已经被手动关掉了，跳过即可。
    }
    // 页面还原成普通网页：撤销铺满、移除注入的控制条与退出按钮。
    await chrome.scripting.executeScript({
      target: { tabId: session.tabId, allFrames: true },
      func: stopTheaterMode
    }).catch(() => {});
  }

  // 兜底：万一有播放窗口没被自动关掉（例如里面还有别的标签），补一刀。
  await Promise.allSettled(sessions.map(session => chrome.windows.remove(session.windowId).catch(() => {})));
  await chrome.storage.local.set({ playerSessions: [] });
  return { restored };
}

async function closeAllPlayerWindows() {
  const sessions = await getPlayerSessions();
  if (!sessions.length) return { closed: 0 };
  // 逐个关闭：单个窗口已经不存在时不应影响其余窗口，因此用 allSettled 收敛结果。
  await Promise.allSettled(sessions.map(session => chrome.windows.remove(session.windowId)));
  await chrome.storage.local.set({ playerSessions: [] });
  return { closed: sessions.length };
}

// ---------- 视频书签 ----------
// 书签挂在「归一化后的视频网址」上，而不是挂在窗口上：窗口只是临时载体，
// 关掉窗口/浏览器都不影响书签，下次打开同一网址时再按 URL 查回来。

// 需要剥掉的跟踪参数。注意保留 p / v / ep / season 这类真正区分内容的参数。
const BOOKMARK_TRACKING_PARAMS = /^(t|start|time_continue|from|from_source|spm_id_from|vd_source|si|feature|ref|refer|fbclid|gclid|_source|share_source|share_medium|share_plat|share_tag|timestamp|unique_k|utm_.*|share_.*)$/i;

function normalizeVideoUrl(raw) {
  try {
    const url = new URL(raw);
    const drop = [];
    for (const key of url.searchParams.keys()) {
      if (BOOKMARK_TRACKING_PARAMS.test(key)) drop.push(key);
    }
    for (const key of drop) url.searchParams.delete(key);
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch (_) {
    return String(raw || '');
  }
}

async function getBookmarkStore() {
  const { bookmarks = {} } = await chrome.storage.local.get('bookmarks');
  return bookmarks;
}

async function getBookmarks(url) {
  const store = await getBookmarkStore();
  const entry = store[normalizeVideoUrl(url)];
  return entry ? entry.items : [];
}

async function addBookmark(url, title, time, duration, note) {
  const key = normalizeVideoUrl(url);
  if (!key) throw new Error('缺少视频网址，无法记录书签。');
  const store = await getBookmarkStore();
  const entry = store[key] || { url, title: title || url, items: [] };
  entry.url = url || entry.url;
  if (title) entry.title = title;
  const seconds = Number(time);
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error('当前播放进度不可用，无法记录书签。');
  const item = {
    id: `bm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    time: seconds,
    duration: Number.isFinite(Number(duration)) && Number(duration) > 0 ? Number(duration) : 0,
    // 备注默认是空的，之后可以在控制条浮层或控制中心里补。
    note: typeof note === 'string' ? note.trim().slice(0, 200) : '',
    createdAt: Date.now()
  };
  entry.items = [...entry.items, item].sort((a, b) => a.time - b.time);
  store[key] = entry;
  await chrome.storage.local.set({ bookmarks: store });
  return item;
}

// 备注是后补的，所以单独开一个只改备注的接口，避免整条书签重建导致 id / 排序变化。
async function setBookmarkNote(id, note) {
  const store = await getBookmarkStore();
  const text = typeof note === 'string' ? note.trim().slice(0, 200) : '';
  for (const key of Object.keys(store)) {
    const target = store[key].items.find(item => item.id === id);
    if (target) {
      target.note = text;
      await chrome.storage.local.set({ bookmarks: store });
      return { id, note: text };
    }
  }
  throw new Error('找不到这条书签，可能已被删除。');
}

async function removeBookmark(id) {
  const store = await getBookmarkStore();
  let removed = 0;
  for (const key of Object.keys(store)) {
    const entry = store[key];
    const next = entry.items.filter(item => item.id !== id);
    if (next.length !== entry.items.length) {
      removed += entry.items.length - next.length;
      if (next.length) entry.items = next;
      else delete store[key];
    }
  }
  if (removed) await chrome.storage.local.set({ bookmarks: store });
  return { removed };
}

async function listAllBookmarks() {
  const store = await getBookmarkStore();
  return Object.entries(store)
    .map(([key, entry]) => ({ key, url: entry.url, title: entry.title, items: entry.items }))
    .filter(entry => entry.items.length)
    .sort((a, b) => {
      const at = Math.max(...a.items.map(i => i.createdAt || 0));
      const bt = Math.max(...b.items.map(i => i.createdAt || 0));
      return bt - at;
    });
}

async function importBookmarks(groups) {
  if (!Array.isArray(groups)) throw new Error('导入内容格式不正确。');
  const store = await getBookmarkStore();
  let added = 0;
  for (const group of groups) {
    const key = normalizeVideoUrl(group && group.url);
    if (!key || !Array.isArray(group.items)) continue;
    const entry = store[key] || { url: group.url, title: group.title || group.url, items: [] };
    if (group.title) entry.title = group.title;
    const existing = new Set(entry.items.map(i => `${i.time}|${i.duration}`));
    for (const raw of group.items) {
      const seconds = Number(raw && raw.time);
      if (!Number.isFinite(seconds) || seconds < 0) continue;
      const duration = Number(raw && raw.duration) || 0;
      if (existing.has(`${seconds}|${duration}`)) continue;
      entry.items.push({
        id: `bm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        time: seconds,
        duration,
        note: typeof (raw && raw.note) === 'string' ? raw.note.trim().slice(0, 200) : '',
        createdAt: Number(raw && raw.createdAt) || Date.now()
      });
      existing.add(`${seconds}|${duration}`);
      added += 1;
    }
    entry.items.sort((a, b) => a.time - b.time);
    store[key] = entry;
  }
  await chrome.storage.local.set({ bookmarks: store });
  return { added };
}

// 跳到书签。若对应视频当前没打开，直接用书签里存的网址新开一个播放窗口，
// 等视频就绪后再跳转 —— 这样控制中心里点书签是"一步到位"，不需要先手动打开。
// 定位优先按秒数；若当前时长与记录时相差超过 5%（不同片源版本），改按百分比换算。
async function jumpToBookmark(key, time, savedDuration, url) {
  let sessions = await getPlayerSessions();
  let target = sessions.find(session => normalizeVideoUrl(session.url) === key);
  let opened = false;

  if (!target) {
    if (!url) return { applied: false, reason: 'no-url' };
    await openPlayerWindows([url]);
    opened = true;
    sessions = await getPlayerSessions();
    target = sessions.find(session => normalizeVideoUrl(session.url) === key) || sessions[sessions.length - 1];
    if (!target || !target.tabId) return { applied: false, reason: 'open-failed', opened: true };
    // 页面加载完不等于视频就绪，必须等到 duration 可用才谈得上跳转。
    await waitForVideoReady(target.tabId);
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: target.tabId, allFrames: true },
    func: applyBookmarkSeek,
    args: [Number(time) || 0, Number(savedDuration) || 0]
  });
  if (target.windowId) {
    await chrome.windows.update(target.windowId, { state: 'normal' }).catch(() => {});
    await chrome.windows.update(target.windowId, { focused: true }).catch(() => {});
  }
  return { applied: results.some(item => item.result && item.result.ok), opened };
}

// 轮询等待目标页面的 video 拿到可用时长（新开的窗口需要一点时间加载片源）。
async function waitForVideoReady(tabId, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: probeVideoReady
    }).catch(() => []);
    if (results.some(item => item.result)) return true;
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  return false;
}

// 同样会被序列化到目标网页中执行。
function probeVideoReady() {
  const videos = [...document.querySelectorAll('video')].filter(video => {
    const rect = video.getBoundingClientRect();
    return rect.width > 32 && rect.height > 32;
  });
  return videos.some(video => Number.isFinite(video.duration) && video.duration > 0);
}

// 此函数会被序列化到目标网页中，不能引用扩展环境的变量。
function applyBookmarkSeek(time, savedDuration) {
  const visible = [...document.querySelectorAll('video')].filter(video => {
    const style = getComputedStyle(video);
    const rect = video.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 32 && rect.height > 32;
  }).sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return br.width * br.height - ar.width * ar.height;
  });
  const video = visible[0];
  if (!video) return { ok: false, reason: 'no-video' };
  let target = time;
  if (savedDuration > 0 && Number.isFinite(video.duration) && video.duration > 0) {
    const drift = Math.abs(video.duration - savedDuration) / savedDuration;
    if (drift > 0.05) target = (time / savedDuration) * video.duration;
  }
  if (Number.isFinite(video.duration) && video.duration > 0) {
    target = Math.max(0, Math.min(video.duration, target));
  }
  video.currentTime = target;
  return { ok: true, currentTime: video.currentTime, duration: video.duration };
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
  // value 为 undefined 时不能直接放进 args：executeScript 要求参数可序列化，
  // 否则会同步抛出 "Value is unserializable"，导致整条统一控制链路中断。
  const args = value === undefined ? [action] : [action, value];
  return Promise.allSettled(sessions.map(session => {
    try {
      return chrome.scripting.executeScript({
        target: { tabId: session.tabId, allFrames: true },
        func: controlPageVideo,
        args
      });
    } catch (error) {
      // executeScript 的参数校验错误是同步抛出的，Promise.allSettled 捕获不到，
      // 这里显式转成 rejected promise，避免单个窗口的失败拖垮整批控制。
      return Promise.reject(error);
    }
  }));
}

function countFound(outcomes) {
  return outcomes.reduce((count, outcome) => {
    if (outcome.status !== 'fulfilled') return count;
    return count + outcome.value.filter(frame => frame.result?.found).length;
  }, 0);
}

// 等该标签加载完成后注入铺满播放器 + 控制条。失败静默（页面可能拒绝注入）。
// 独立成函数是为了配合「先建齐所有窗口 → 立即排列 → 并行注入」的流程：
// 排列绝不能等页面加载 —— 真实视频站一个页面十几秒，串行等下来用户盯着级联小窗看半分钟。
function injectTheaterMode(tabId, options) {
  return waitForTabLoad(tabId)
    .then(() => chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: startTheaterMode,
      args: [options]
    }))
    .catch(() => {});
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
// 参数是选项对象，不是位置参数：此前是 (visible, autoHide, shortcut) 三个位置参数，
// 每加一项配置都得改 6 个注入点、还得记住顺序，太容易错。
function startTheaterMode(options = {}) {
  const showFloatingControls = options.visible !== false;
  const autoHideControls = options.autoHide !== false;
  const previewOnHover = options.preview !== false;
  const toggleShortcut = typeof options.shortcut === 'string' ? options.shortcut : '';
  const stateKey = '__multiWindowWebPlayerState__';
  const nextAutoHide = autoHideControls !== false;
  const nextPreview = previewOnHover;
  const nextShortcut = String(toggleShortcut || '').trim();
  if (window[stateKey]?.active) {
    const currentVideo = [...document.querySelectorAll('video')].filter(video => {
      const rect = video.getBoundingClientRect();
      return rect.width > 32 && rect.height > 32;
    }).sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return br.width * br.height - ar.width * ar.height;
    })[0];
    window[stateKey].autoHide = nextAutoHide;
    // 预览开关同理必须写回 state：重建控制条时 installPlaybackControls 是从 state 读这两个值的，
    // 不更新的话重建出来的还是旧设置 —— 实测表现为「关掉预览后再打开，悬停没反应」。
    window[stateKey].preview = nextPreview;
    // 快捷键变了就换掉旧的监听（控制条那边则按 autoHide 变化决定是否重建）。
    if (window[stateKey].toggleShortcut !== nextShortcut) {
      if (Array.isArray(window[stateKey].shortcutCleanup)) {
        window[stateKey].shortcutCleanup.forEach(cleanup => {
          try { cleanup(); } catch (_) { /* 单个清理失败不该影响重装 */ }
        });
      }
      installToggleShortcut(window[stateKey], nextShortcut);
    }
    const existingControls = document.querySelector('[data-multi-player-controls]');
    // 自动隐藏或悬停预览开关变了就拆掉重建：两者都在创建时把值收进了闭包，就地改容易漏。
    const needsRebuild = existingControls && (
      existingControls.dataset.autoHide !== String(nextAutoHide) ||
      existingControls.dataset.preview !== String(nextPreview)
    );
    if (needsRebuild) {
      // 重建前先把旧控制条挂在 document / window 上的监听收干净，
      // 否则每切换一次设置就会留下一批指向已删除元素的监听器。
      if (Array.isArray(window[stateKey].controlsCleanup)) {
        window[stateKey].controlsCleanup.forEach(cleanup => {
          try { cleanup(); } catch (_) { /* 单个清理失败不该影响重建 */ }
        });
      }
      if (currentVideo && showFloatingControls) installPlaybackControls(currentVideo, window[stateKey]);
    } else if (existingControls) {
      existingControls.style.setProperty('display', showFloatingControls ? 'flex' : 'none', 'important');
    } else if (currentVideo && showFloatingControls) {
      installPlaybackControls(currentVideo, window[stateKey]);
    }
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
  const state = { active: true, saved, cleanup: [], autoHide: nextAutoHide, preview: nextPreview, toggleShortcut: nextShortcut };
  window[stateKey] = state;
  installExitButton(state);
  installPlaybackControls(video, state);
  installToggleShortcut(state, nextShortcut);
  // 这里刻意不调用 play()。扩展用 chrome.windows.create 开出的窗口没有用户手势，
  // 浏览器的自动播放策略会以 NotAllowedError 拒绝带声音的 play()；静音降级又会让用户
  // 莫名其妙听不到声音。所以交给用户点页面自己的播放按钮，或用悬浮控制条上的播放键。
  return { status: 'video-expanded', tag: box.tagName };

  // 自定义切换快捷键。Chrome 的 commands.suggested_key 写死在 manifest 里、运行时改不了，
  // 所以这里在播放窗口内自己监听一份，让用户能在控制中心里改。
  // 这段必须完全自包含 —— startTheaterMode 会被序列化后注入目标页面，
  // 引用外层作用域的任何东西在页面里都会是 undefined。
  function installToggleShortcut(currentState, spec) {
    if (!spec) return;
    const normalize = event => {
      const raw = String(event.key || '');
      if (raw === ' ') return 'Space';
      if (raw === 'Escape') return 'Esc';
      return raw.length === 1 ? raw.toUpperCase() : raw;
    };
    const matches = event => {
      const parts = String(spec).split('+').map(part => part.trim()).filter(Boolean);
      if (parts.length < 2) return false;
      const key = parts[parts.length - 1].toUpperCase();
      const mods = parts.slice(0, -1).map(part => part.toLowerCase());
      const wantCtrl = mods.includes('ctrl') || mods.includes('control');
      const wantShift = mods.includes('shift');
      const wantAlt = mods.includes('alt');
      const wantMeta = mods.includes('meta') || mods.includes('cmd') || mods.includes('command');
      if (event.ctrlKey !== wantCtrl || event.shiftKey !== wantShift) return false;
      if (event.altKey !== wantAlt || event.metaKey !== wantMeta) return false;
      return normalize(event).toUpperCase() === key;
    };
    const onKey = event => {
      if (!matches(event)) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'toggle-dashboard-grid' }).catch(() => {});
      }
    };
    document.addEventListener('keydown', onKey, true);
    currentState.shortcutCleanup = [() => document.removeEventListener('keydown', onKey, true)];
    currentState.cleanup.push(...currentState.shortcutCleanup);
  }

  function installExitButton(currentState) {    const button = document.createElement('button');
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
    // 自动隐藏模式记在 DOM 上，便于「开关变了就拆掉重建」那条路径判断是否需要重装。
    bar.dataset.autoHide = String(Boolean(currentState.autoHide));
    // 悬停预览开关也记在 DOM 上，理由同上：开关变了要拆掉重建控制条。
    bar.dataset.preview = String(Boolean(currentState.preview));
    const autoHide = () => bar.dataset.autoHide === 'true';
    // 自动隐藏：平时完全收起（透明 + 不接收点击，否则会挡住视频上的操作），
    // 鼠标进到窗口里才出现。关闭该模式时保持原来的「半透明常显、悬停变亮」。
    const setBarVisible = visible => {
      if (autoHide()) {
        bar.style.setProperty('opacity', visible ? '1' : '0', 'important');
        bar.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
      } else {
        bar.style.setProperty('pointer-events', 'auto', 'important');
        bar.style.setProperty('opacity', visible ? '1' : '.22', 'important');
      }
    };
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
    const mark = makeButton('＋', '把当前进度记为书签');
    const marks = makeButton('⚑', '查看书签');
    range.type = 'range'; range.min = '0'; range.max = '1000'; range.value = '0';
    range.setAttribute('aria-label', '视频进度');
    range.style.cssText = 'flex:1!important;min-width:50px!important;accent-color:#b7ee6a!important;cursor:pointer!important';
    [current, total].forEach(item => item.style.cssText = 'color:#e0e2e3!important;font:10px ui-monospace,Consolas,monospace!important;white-space:nowrap!important');
    const separator = document.createElement('span'); separator.textContent = '/'; separator.style.cssText = 'color:#83878c!important;font-size:10px!important;margin:-6px!important';
    const markPanel = document.createElement('div');
    markPanel.setAttribute('data-multi-player-bookmarks', 'true');
    markPanel.style.cssText = 'position:fixed!important;right:8px!important;left:auto!important;bottom:74px!important;z-index:2147483647!important;display:none!important;flex-direction:column!important;gap:4px!important;width:min(320px,calc(100vw - 34px))!important;max-height:250px!important;overflow:auto!important;padding:8px!important;border:1px solid #ffffff2b!important;border-radius:9px!important;background:#121212f2!important;box-shadow:0 8px 30px #000a!important;backdrop-filter:blur(10px)!important';
    // 浮层右边缘对齐控制条右边缘（也就是 ⚑ 按钮那一侧）、底边压在控制条正上方。
    // 原来是 left:50% + translateX(-50%) 水平居中，面板离按钮有半个控制条那么远，
    // 鼠标要横移一大段才够得到，点击很别扭。
    const positionPanel = () => {
      const rect = bar.getBoundingClientRect();
      markPanel.style.setProperty('right', `${Math.max(8, Math.round(window.innerWidth - rect.right))}px`, 'important');
      markPanel.style.setProperty('bottom', `${Math.max(8, Math.round(window.innerHeight - rect.top + 8))}px`, 'important');
    };
    bar.append(back, toggle, forward, current, separator, total, range, mute, mark, marks);
    document.body.append(bar, markPanel);
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

    // ---- 进度条悬停预览 ----
    // 鼠标扫过进度条时，上方浮出「该时间点的画面 + 时间」，进度条上画一条竖线标位置。
    //
    // 画面靠另开一路独立 video 抽帧：主视频绝不能 seek（会打断播放），
    // 所以复制一个同源的 video，seek 到目标时间后把当前帧 drawImage 到 canvas 上。
    // 实测（见 _bugcheck/preview-probe.js）：直链和普通 Blob 都能抽到帧，且主视频 currentTime 不受影响；
    // 但 MediaSource 的 blob URL 没法被第二个 video 复用（报 Format error），
    // 这种情况静默降级成只显示时间，并记住失败状态 —— 否则每次悬停都要白等一次超时。
    const preview = document.createElement('div');
    preview.setAttribute('data-multi-player-preview', 'true');
    preview.style.cssText = 'position:fixed!important;left:0!important;bottom:0!important;z-index:2147483647!important;display:none!important;flex-direction:column!important;align-items:center!important;gap:4px!important;padding:4px!important;border:1px solid #ffffff2b!important;border-radius:7px!important;background:#121212f2!important;box-shadow:0 8px 24px #000b!important;backdrop-filter:blur(8px)!important;pointer-events:none!important;transform:translateX(-50%)!important';
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 160; previewCanvas.height = 90;
    // 先不显示：抽到第一帧之前显示出来会是个黑块，比没有还难看。
    previewCanvas.style.cssText = 'display:none!important;width:160px!important;height:90px!important;border-radius:4px!important;background:#000!important';
    const previewTime = document.createElement('span');
    previewTime.style.cssText = 'color:#e8eaed!important;font:11px ui-monospace,Consolas,monospace!important;line-height:1!important';
    preview.append(previewCanvas, previewTime);
    const previewMarker = document.createElement('div');
    previewMarker.setAttribute('data-multi-player-preview-marker', 'true');
    previewMarker.style.cssText = 'position:fixed!important;width:2px!important;border-radius:1px!important;background:#b7ee6a!important;box-shadow:0 0 6px #b7ee6a99!important;z-index:2147483647!important;display:none!important;pointer-events:none!important';
    document.body.append(preview, previewMarker);

    const PREVIEW_THROTTLE_MS = 90;
    let previewVideo = null;     // 抽帧用的独立 video，懒创建、全程复用
    let previewBroken = false;   // 抽不出帧就不再试（MSE 源必然失败，重试只会让每次悬停都卡一下）
    let previewSeq = 0;          // 请求序号，用来丢弃过期的抽帧结果
    let previewThrottle = 0;

    const waitForEvent = (element, name, ms) => new Promise((resolve, reject) => {
      let timer = 0;
      const onDone = () => { clearTimeout(timer); resolve(); };
      timer = setTimeout(() => {
        element.removeEventListener(name, onDone);
        reject(new Error('timeout'));
      }, ms);
      element.addEventListener(name, onDone, { once: true });
    });

    const ensurePreviewVideo = () => {
      if (previewVideo || previewBroken) return previewVideo;
      const source = currentVideo.currentSrc || currentVideo.src;
      if (!source) { previewBroken = true; return null; }
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.style.cssText = 'position:fixed!important;left:-99999px!important;top:0!important;width:2px!important;height:2px!important;opacity:0!important;pointer-events:none!important';
      // 刻意不设 crossOrigin：设了会让一部分站点直接加载失败。
      // drawImage 只要不回头读像素就不受跨域污染限制，所以不需要它。
      video.addEventListener('error', () => { previewBroken = true; }, { once: true });
      video.src = source;
      previewVideo = video;
      document.body.append(video);
      return video;
    };

    const drawPreviewFrame = async time => {
      const video = ensurePreviewVideo();
      if (!video) return false;
      try {
        if (video.readyState < 1) await waitForEvent(video, 'loadedmetadata', 2500);
        if (!Number.isFinite(video.duration) || video.duration <= 0) return false;
        const target = Math.max(0, Math.min(time, video.duration - 0.05));
        if (Math.abs(video.currentTime - target) > 0.05) {
          const seeked = waitForEvent(video, 'seeked', 2000);
          video.currentTime = target;
          await seeked;
        }
        previewCanvas.getContext('2d').drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
        return true;
      } catch (_) {
        return false;
      }
    };

    const hidePreview = () => {
      preview.style.setProperty('display', 'none', 'important');
      previewMarker.style.setProperty('display', 'none', 'important');
      previewSeq += 1;   // 让还在飞的抽帧结果作废
      if (previewThrottle) { clearTimeout(previewThrottle); previewThrottle = 0; }
    };

    const showPreviewAt = clientX => {
      const duration = currentVideo.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const rect = range.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const time = ratio * duration;
      previewTime.textContent = format(time);

      preview.style.setProperty('display', 'flex', 'important');
      previewMarker.style.setProperty('display', 'block', 'important');
      // 气泡中心跟着鼠标，但夹在窗口内 —— 否则贴着左右边缘时整个气泡会跑到窗口外面。
      const half = (preview.offsetWidth || 168) / 2;
      const center = Math.min(window.innerWidth - half - 6, Math.max(half + 6, clientX));
      preview.style.setProperty('left', `${Math.round(center)}px`, 'important');
      preview.style.setProperty('bottom', `${Math.max(8, Math.round(window.innerHeight - rect.top + 14))}px`, 'important');
      // 竖线画在进度条上，比进度条本身高一点，好认。
      previewMarker.style.setProperty('left', `${Math.round(rect.left + ratio * rect.width)}px`, 'important');
      previewMarker.style.setProperty('top', `${Math.round(rect.top - 4)}px`, 'important');
      previewMarker.style.setProperty('height', `${Math.round(rect.height + 8)}px`, 'important');

      // 节流 + 只认最后一次：鼠标扫得快的时候，中间的抽帧请求全部丢弃。
      // 不这么做的话一串 seek 排队等解码，画面会闪来闪去。
      const seq = previewSeq + 1;
      previewSeq = seq;
      if (previewThrottle) clearTimeout(previewThrottle);
      previewThrottle = setTimeout(async () => {
        previewThrottle = 0;
        if (seq !== previewSeq) return;
        const ok = await drawPreviewFrame(time);
        if (seq !== previewSeq) return;   // 抽帧期间鼠标又动了，这次结果作废
        previewCanvas.style.setProperty('display', ok ? 'block' : 'none', 'important');
      }, PREVIEW_THROTTLE_MS);
    };

    const onRangeMove = event => { if (previewOnHover) showPreviewAt(event.clientX); };
    range.addEventListener('pointermove', onRangeMove);
    range.addEventListener('pointerleave', hidePreview);
    // 拖动时指针被 range 捕获，pointermove 会继续派发过来，预览跟着走 —— 正是想要的效果。
    // 进度条上盖着预览会挡住命中检测，所以两个元素都设了 pointer-events:none。

    // ---- 视频书签 ----
    let bookmarkItems = [];
    const canMessage = () => typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;
    const renderBookmarks = () => {
      markPanel.replaceChildren();
      marks.textContent = bookmarkItems.length ? `⚑${bookmarkItems.length}` : '⚑';
      if (!bookmarkItems.length) {
        const empty = document.createElement('span');
        empty.textContent = '还没有书签，点 ＋ 记录当前进度';
        empty.style.cssText = 'color:#9aa0a6!important;font:11px system-ui!important;padding:7px 5px!important';
        markPanel.append(empty);
        return;
      }
      bookmarkItems.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex!important;align-items:center!important;gap:6px!important';
        const jump = document.createElement('button');
        jump.type = 'button';
        jump.title = `跳到 ${format(item.time)}`;
        jump.style.cssText = 'flex:1!important;min-width:0!important;display:flex!important;align-items:center!important;gap:8px!important;text-align:left!important;padding:6px 9px!important;border:0!important;border-radius:5px!important;background:#2b2d31!important;color:#f0f0f0!important;font:12px ui-monospace,Consolas,monospace!important;cursor:pointer!important';
        const stamp = document.createElement('span');
        stamp.textContent = format(item.time);
        stamp.style.cssText = 'flex:none!important';
        jump.append(stamp);
        if (item.note) {
          const note = document.createElement('span');
          note.textContent = item.note;
          note.title = item.note;
          note.style.cssText = 'flex:1!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#9aa0a6!important;font:11px system-ui!important';
          jump.append(note);
        }
        jump.addEventListener('click', () => {
          // 时长差异超过 5% 时按百分比换算，避免不同片源版本整体偏移。
          let target = item.time;
          if (item.duration > 0 && Number.isFinite(currentVideo.duration) && currentVideo.duration > 0) {
            if (Math.abs(currentVideo.duration - item.duration) / item.duration > 0.05) {
              target = item.time / item.duration * currentVideo.duration;
            }
          }
          if (Number.isFinite(currentVideo.duration) && currentVideo.duration > 0) {
            target = Math.max(0, Math.min(currentVideo.duration, target));
          }
          currentVideo.currentTime = target;
          markPanel.style.setProperty('display', 'none', 'important');
        });
        const drop = document.createElement('button');
        drop.type = 'button';
        drop.textContent = '×';
        drop.setAttribute('aria-label', '删除该书签');
        drop.style.cssText = 'width:25px!important;height:25px!important;border:0!important;border-radius:5px!important;background:#3a2526!important;color:#ff9d9d!important;font:13px system-ui!important;cursor:pointer!important';
        drop.addEventListener('click', async () => {
          if (!canMessage()) return;
          await chrome.runtime.sendMessage({ type: 'remove-bookmark', id: item.id }).catch(() => {});
          bookmarkItems = bookmarkItems.filter(entry => entry.id !== item.id);
          renderBookmarks();
        });
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = '✎';
        edit.setAttribute('aria-label', `编辑 ${format(item.time)} 的备注`);
        edit.title = '编辑备注';
        edit.style.cssText = 'width:25px!important;height:25px!important;border:0!important;border-radius:5px!important;background:#2b2d31!important;color:#d7dbe0!important;font:12px system-ui!important;cursor:pointer!important';
        edit.addEventListener('click', () => startNoteEdit(item, row));
        row.append(jump, edit, drop);
        markPanel.append(row);
      });
    };

    // 就地编辑备注：Enter 保存、Esc 取消、失焦也保存。备注可以为空。
    const startNoteEdit = (item, row) => {
      let settled = false;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = item.note || '';
      input.placeholder = '备注（可留空）';
      input.maxLength = 200;
      input.setAttribute('aria-label', '书签备注');
      input.style.cssText = 'flex:1!important;min-width:0!important;height:29px!important;padding:0 9px!important;border:1px solid #4b5563!important;border-radius:5px!important;background:#1b1d21!important;color:#f0f0f0!important;font:12px system-ui!important;outline:none!important';
      const finish = async save => {
        if (settled) return;
        settled = true;
        if (save) {
          const note = input.value.trim();
          if (canMessage()) {
            await chrome.runtime.sendMessage({ type: 'set-bookmark-note', id: item.id, note }).catch(() => {});
          }
          item.note = note;
        }
        renderBookmarks();
      };
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); finish(true); }
        else if (event.key === 'Escape') { event.preventDefault(); finish(false); }
      });
      input.addEventListener('blur', () => finish(true));
      row.replaceChildren(input);
      input.focus();
      input.select();
    };
    const loadBookmarks = async () => {
      if (!canMessage()) return;
      const result = await chrome.runtime.sendMessage({ type: 'get-bookmarks', url: location.href }).catch(() => null);
      if (result && result.ok) { bookmarkItems = result.items || []; renderBookmarks(); }
    };
    mark.addEventListener('click', async () => {
      if (!canMessage() || !Number.isFinite(currentVideo.currentTime)) return;
      const result = await chrome.runtime.sendMessage({
        type: 'add-bookmark',
        url: location.href,
        title: document.title,
        time: currentVideo.currentTime,
        duration: currentVideo.duration
      }).catch(() => null);
      if (result && result.ok) {
        bookmarkItems = [...bookmarkItems, result.item].sort((a, b) => a.time - b.time);
        renderBookmarks();
        positionPanel();
        markPanel.style.setProperty('display', 'flex', 'important');
      }
    });
    marks.addEventListener('click', () => {
      const isHidden = markPanel.style.display !== 'flex';
      markPanel.style.setProperty('display', isHidden ? 'flex' : 'none', 'important');
      if (isHidden) {
        positionPanel();
        loadBookmarks();
      }
    });
    // 窗口尺寸一变，预览气泡和竖线的位置就失效了，顺手收掉。
    const onResize = () => { positionPanel(); hidePreview(); };
    window.addEventListener('resize', onResize, { passive: true });
    loadBookmarks();

    // 鼠标停住不动超过这么久就自动淡出，不用非得把指针移出窗口。
    const IDLE_HIDE_MS = 3000;
    let idleTimer = null;
    const cancelIdle = () => { if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; } };
    const scheduleIdle = () => {
      cancelIdle();
      if (!autoHide()) return;
      idleTimer = setTimeout(() => {
        idleTimer = null;
        // 鼠标还停在控制条或书签浮层上、或浮层开着的时候不收，否则会点不到。
        if (bar.matches(':hover') || markPanel.matches(':hover') || markPanel.style.display === 'flex') {
          scheduleIdle();
          return;
        }
        dim(true);
      }, IDLE_HIDE_MS);
    };
    const reveal = () => { setBarVisible(true); scheduleIdle(); };
    // force：鼠标离开整个窗口或空闲超时时用。那一刻 :hover 可能还没更新，不能靠它判断。
    const dim = (force = false) => {
      if (!force && bar.matches(':hover')) return;
      cancelIdle();
      setBarVisible(false);
      // 控制条一收起，挂在它上面的悬停预览也必须收，否则会剩一个预览框孤零零浮在画面上。
      hidePreview();
      // 自动隐藏时，控制条一收起就把书签浮层一并收掉，免得留个孤零零的浮层挂在画面上。
      if (autoHide()) markPanel.style.setProperty('display', 'none', 'important');
    };
    const onWindowLeave = () => dim(true);
    bar.addEventListener('mouseenter', reveal);
    // 自动隐藏模式下，鼠标离开控制条不收起：往书签浮层移的时候会经过中间那道空隙，
    // 那时会被误判成"离开"，把浮层一起收掉导致点不到。只在离开整个窗口或空闲超时时才收。
    bar.addEventListener('mouseleave', () => { if (!autoHide()) dim(); });
    document.addEventListener('mousemove', reveal, { passive: true });
    document.documentElement.addEventListener('mouseleave', onWindowLeave);
    // 两种模式的初始态都是"收起"：自动隐藏时完全透明，非自动隐藏时是半透明常显（opacity .22）。
    setBarVisible(false);
    const events = ['timeupdate', 'loadedmetadata', 'durationchange', 'play', 'pause', 'volumechange'];
    events.forEach(event => currentVideo.addEventListener(event, refresh));
    refresh();
    // 控制条自己的一套清理动作单独存一份：切换自动隐藏设置时要先跑一遍再重建，
    // 不能只 push 进 currentState.cleanup（那里还混着退出按钮等与本次重建无关的清理）。
    const controlsCleanup = [
      () => bar.remove(),
      () => markPanel.remove(),
      () => preview.remove(),
      () => previewMarker.remove(),
      // 抽帧用的隐藏 video 也要撤掉，否则会一直占着一路解码。
      () => { if (previewVideo) previewVideo.remove(); },
      () => range.removeEventListener('pointermove', onRangeMove),
      () => range.removeEventListener('pointerleave', hidePreview),
      () => events.forEach(event => currentVideo.removeEventListener(event, refresh)),
      () => document.removeEventListener('mousemove', reveal),
      () => document.documentElement.removeEventListener('mouseleave', onWindowLeave),
      () => window.removeEventListener('resize', onResize),
      () => cancelIdle(),
      () => hidePreview()
    ];
    currentState.controlsCleanup = controlsCleanup;
    currentState.cleanup.push(...controlsCleanup);
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
