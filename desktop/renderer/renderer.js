const $ = (s, r=document) => r.querySelector(s);
const tabsEl = $('#tabs');

function render(tabs, activeId) {
  tabsEl.innerHTML = '';
  for (const t of tabs) {
    const el = document.createElement('div');
    el.className = 'tab' + (t.id === activeId ? ' active' : '');
    el.innerHTML = `<span>${t.title || new URL(t.url).hostname}</span> <button class="x" title="Close">×</button>`;
    el.onclick = (e) => {
      if (e.target.closest('.x')) return;
      AU.tabs.activate(t.id);
    };
    el.querySelector('.x').onclick = (e) => {
      e.stopPropagation();
      AU.tabs.close(t.id);
    };
    tabsEl.appendChild(el);
  }
}

AU.tabs.list().then((list)=>render(list, null));
AU.onTabsChanged(render);

$('#newTab').onclick = async () => {
  const url = prompt('Open URL', 'https://example.com/');
  if (!url) return;
  await AU.tabs.create(url);
};

$('#openLauncher').onclick = async () => {
  await AU.tabs.create('https://YOUR-DOMAIN-HERE/index.html');
};
