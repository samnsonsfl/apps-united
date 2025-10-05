const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AU', {
  tabs: {
    list: () => ipcRenderer.invoke('tabs:list'),
    create: (url) => ipcRenderer.invoke('tabs:create', url),
    activate: (id) => ipcRenderer.invoke('tabs:activate', id),
    close: (id) => ipcRenderer.invoke('tabs:close', id),
    popOut: (id) => ipcRenderer.invoke('tabs:popOut', id)
  },
  // events from main
  onTabsChanged: (fn) => ipcRenderer.on('tabs:changed', (_e, tabs, activeId) => fn(tabs, activeId))
});
