// Apps United — minimal built-in tabbed browser
// This wraps your existing web launcher and intercepts clicks to open each app in its own tab.

const { app, BrowserWindow, BrowserView, ipcMain, shell } = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin';

// 👉 Set this to your launcher.
// Option A: hosted page (recommended) — paste your live URL:
const LAUNCHER_URL = 'https://YOUR-DOMAIN-HERE/index.html';

// Option B: local file — point to your existing web `index.html` on disk:
// const LAUNCHER_URL = 'file://' + path.resolve('PATH/TO/your-web-folder/index.html');

let mainWindow;
let tabs = [];           // [{id, title, url, view}]
let activeId = null;

function makeId(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    title: 'Apps United',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // First tab = your launcher
  const first = createTab(LAUNCHER_URL, 'Launcher');
  activateTab(first.id);

  mainWindow.on('resize', layoutAll);
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTab(url, titleFallback = 'Loading…') {
  const view = new BrowserView({ webPreferences: { partition: 'persist:apps' } });
  const id = makeId();

  view.webContents.loadURL(url);
  view.webContents.on('page-title-updated', (_e, title) => {
    const t = tabs.find(x => x.id === id);
    if (t) { t.title = title || titleFallback; sendTabs(); }
  });

  // Popups / target=_blank go to new AU tab
  view.webContents.setWindowOpenHandler(({ url }) => {
    createTab(url); // new AU tab
    return { action: 'deny' };
  });

  // If the launcher tries to navigate away, open in a new tab instead
  view.webContents.on('will-navigate', (event, nextUrl) => {
    // Only “protect” the launcher tab from being replaced
    const isLauncherTab = tabs.length && tabs[0].id === id && tabs[0].url === LAUNCHER_URL;
    if (isLauncherTab && nextUrl !== LAUNCHER_URL) {
      event.preventDefault();
      createTab(nextUrl);
    }
  });

  const t = { id, title: titleFallback, url, view };
  tabs.push(t);
  sendTabs();
  return t;
}

function activateTab(id) {
  const t = tabs.find(x => x.id === id);
  if (!t) return;
  activeId = id;

  // Bring selected view to front
  mainWindow.setBrowserView(t.view);
  layoutAll();

  sendTabs();
}

function closeTab(id) {
  const idx = tabs.findIndex(x => x.id === id);
  if (idx === -1) return;
  const t = tabs[idx];
  if (t.view) {
    try { mainWindow.removeBrowserView(t.view); } catch {}
    t.view.destroy();
  }
  tabs.splice(idx, 1);

  if (activeId === id) {
    const next = tabs[idx] || tabs[idx - 1] || tabs[0];
    activeId = next ? next.id : null;
    if (next) {
      mainWindow.setBrowserView(next.view);
      layoutAll();
    }
  }
  sendTabs();
}

function layoutAll() {
  if (!mainWindow) return;
  // Reserve 56px at the top for the renderer tab bar UI
  const [w, h] = mainWindow.getContentSize();
  for (const t of tabs) {
    t.view.setBounds({ x: 0, y: 56, width: w, height: h - 56 });
    t.view.setAutoResize({ width: true, height: true });
  }
}

function sendTabs() {
  if (!mainWindow) return;
  mainWindow.webContents.send('tabs:changed', tabs.map(t => ({
    id: t.id, title: t.title, url: t.url
  })), activeId);
}

// IPC from renderer (tab bar buttons)
ipcMain.handle('tabs:list', () => tabs.map(t => ({ id: t.id, title: t.title, url: t.url })));
ipcMain.handle('tabs:create', (_e, url) => { const t = createTab(url); activateTab(t.id); return t; });
ipcMain.handle('tabs:activate', (_e, id) => { activateTab(id); return { ok: true }; });
ipcMain.handle('tabs:close', (_e, id) => { closeTab(id); return { ok: true }; });
ipcMain.handle('tabs:popOut', async (_e, id) => {
  const t = tabs.find(x => x.id === id);
  if (t) await shell.openExternal(t.url);
  return { ok: true };
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (!isMac) app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
