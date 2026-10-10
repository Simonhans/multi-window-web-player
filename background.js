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
  // 先摆副窗口。主窗口单独放到最后处理 —— 一是避免并行执行时被别人的 state 变更
  // 抢到前面，二是 chrome.windows.update 的 focused:false 会顺带改变 z 序，
  // 所以干脆不给副窗口传 focused，只在主窗口上置顶一次。
  await Promise.all(sessions.slice(1).map((session, offset) => chrome.windows
    .update(session.windowId, { state: 'normal', ...rects[offset + 1] })
    .catch(() => {})));
  // 焦点落在主窗口（第 1 个）而不是最后一个 —— 主副布局下这才是你想看的那块。
  await chrome.windows.update(sessions[0].windowId, {
    state: 'normal', ...rects[0], focused: true
  }).catch(() => {});
}

async function showPlayerGrid() {
  const sessions = await getPlayerSessions();
  if (!sessions.length) return { shown: 0 };
  const currentWindow = await chrome.windows.getLastFocused();
  const playerWindowIds = new Set(sessions.map(session => session.windowId));
  if (currentWindow?.id && !playerWindowIds.has(currentWindow.id)) {
    // 记下最小化之前的窗口状态，切回控制中心时才能原样恢复（最大化 / 普通）。
    await rememberDashboardWindowState(currentWindow.id, currentWindow.state);
    await chrome.windows.update(currentWindow.id, { state: 'minimized' }).catch(() => {});
  }
  await arrangePlayerWindows(sessions);
  // 依次聚焦每个播放窗口：每次聚焦都会把该窗口提到 Z 序最前，
  // 这样全部播放窗口都盖在控制中心之上。主窗口放最后聚焦，保证它是当前活动窗口。
  const ordered = withMainFirst(sessions, await getMainKey());
  for (const session of [...ordered.slice(1), ...ordered.slice(0, 1)]) {
    await chrome.windows.update(session.windowId, { state: 'normal', focused: true }).catch(() => {});
  }
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
  // 这里刻意不调用 play()。扩展用 chrome.windows.create 开出的窗口没有用户手势，
  // 浏览器的自动播放策略会以 NotAllowedError 拒绝带声音的 play()；静音降级又会让用户
  // 莫名其妙听不到声音。所以交给用户点页面自己的播放按钮，或用悬浮控制条上的播放键。
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
    window.addEventListener('resize', positionPanel, { passive: true });
    loadBookmarks();

    const reveal = () => { bar.style.opacity = '1'; };
    const dim = () => { if (!bar.matches(':hover')) bar.style.opacity = '.22'; };
    bar.addEventListener('mouseenter', reveal); bar.addEventListener('mouseleave', dim);
    document.addEventListener('mousemove', reveal, { passive: true });
    const events = ['timeupdate', 'loadedmetadata', 'durationchange', 'play', 'pause', 'volumechange'];
    events.forEach(event => currentVideo.addEventListener(event, refresh));
    refresh();
    currentState.cleanup.push(
      () => bar.remove(),
      () => markPanel.remove(),
      () => events.forEach(event => currentVideo.removeEventListener(event, refresh)),
      () => document.removeEventListener('mousemove', reveal),
      () => window.removeEventListener('resize', positionPanel)
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
