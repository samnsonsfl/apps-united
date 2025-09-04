/* auth-app.jsx — Apps-United (Supabase Auth + Sidebar + Dashboard + Store + Favicons) */
/* global React, ReactDOM, window */
const { useState, useEffect, Component } = React;

const SUPABASE_URL = "https://pvfxettbmykvezwahohh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZnhldHRibXlrdmV6d2Fob2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTc2MzMsImV4cCI6MjA3MjMzMzYzM30.M5V-N3jYDs1Eijqb6ZjscNfEOSMMARe8HI20sRdAOTQ";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error("Supabase client script missing.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

function ErrorBoundary({ children }) {
  return children;
}

function getFaviconUrl(app, size = 128) {
  try {
    if (app?.site_url) {
      const host = new URL(app.site_url).hostname;
      console.log("Using site_url favicon:", host);
      return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;
    }
    if (app?.href) {
      const host = new URL(app.href).hostname;
      console.log("Using href favicon:", host);
      return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;
    }
  } catch {}
  return null;
}

function AppIcon({ app, size = 54 }) {
  const [src, setSrc] = useState(() => getFaviconUrl(app, size));
  const [failed, setFailed] = useState(false);

  function handleError() {
    if (src && src.includes("google.com")) {
      try {
        const origin = new URL(app?.site_url || app?.href).origin;
        const fallback = `${origin}/favicon.ico`;
        console.log("Google favicon failed, trying site favicon:", fallback);
        setSrc(fallback);
      } catch {
        setSrc(null);
        setFailed(true);
      }
    } else {
      setSrc(null);
      setFailed(true);
    }
  }

  if (failed || !src) {
    return (
      <div className="app-icon">
        <span className="app-letter">{(app?.name || "?")[0]}</span>
      </div>
    );
  }

  return <img className="app-icon__img" src={src} alt="" width={size} height={size} onError={handleError} />;
}

function Shell({ children }) {
  return (
    <div className="au-container">
      <header className="au-header" style={{ flexDirection: "column", alignItems: "center" }}>
        <img src="./favicon-192.png" alt="Apps-United logo" style={{ width: 64, height: 64, borderRadius: 16 }} />
        <div style={{ marginTop: 6, textAlign: "center" }}>
          <div className="au-subtle" style={{ fontWeight: 600 }}>Apps-United</div>
          <div className="au-note">All your apps, your way.</div>
        </div>
      </header>
      {children}
    </div>
  );
}

function Sidebar({ folders, currentFolder, setFolder, onStore, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{
      width: collapsed ? "60px" : "200px",
      background: "var(--bg-2)",
      padding: "10px",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          <button className="au-btn au-btn-secondary" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "☰" : "⮜"}</button>
          {!collapsed && <button className="au-btn au-btn-secondary">⚙️</button>}
        </div>
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {folders.map(f => (
              <button
                key={f}
                className={`au-folderchip ${currentFolder === f ? "is-active" : ""}`}
                onClick={() => setFolder(f)}
              >
                {f}
              </button>
            ))}
            <button className="au-btn au-btn-secondary" onClick={onStore}>🛍️ App Store</button>
          </div>
        )}
      </div>
      {!collapsed && (
        <button className="au-btn au-btn-secondary" onClick={onLogout} style={{ marginTop: "auto" }}>
          Logout
        </button>
      )}
    </div>
  );
}

function DashboardPage({ me, myApps, setFolder, currentFolder, search, setSearch, folders, onStore, onLogout }) {
  const visible = currentFolder === "All Apps" ? myApps : myApps.filter(a => (a.folder || "Unsorted") === currentFolder);
  const filtered = search.trim() ? visible.filter(a => a.name.toLowerCase().includes(search.toLowerCase())) : visible;
  return (
    <Shell>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar folders={folders} currentFolder={currentFolder} setFolder={setFolder} onStore={onStore} onLogout={onLogout} />
        <div style={{ flex: 1, padding: "20px" }}>
          <input className="au-input" placeholder="Search your apps…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: "16px" }} />
          <div className="apps-grid apps-grid--5">
            {filtered.map(app => (
              <div key={app.id} className="app-tile">
                <a href={app.href} target="_blank" rel="noopener noreferrer" className="app-body">
                  <AppIcon app={app} />
                  <div className="app-name">{app.name}</div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StorePage({ catalog, myApps, setFolder, currentFolder, search, setSearch, folders, onAdd, onLogout }) {
  const visible = currentFolder === "All Apps" ? catalog : catalog.filter(a => (a.folder || "Unsorted") === currentFolder);
  const filtered = search.trim() ? visible.filter(a => a.name.toLowerCase().includes(search.toLowerCase())) : visible;
  const myIds = new Set(myApps.map(a => a.id));
  return (
    <Shell>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar folders={folders} currentFolder={currentFolder} setFolder={setFolder} onStore={() => {}} onLogout={onLogout} />
        <div style={{ flex: 1, padding: "20px" }}>
          <input className="au-input" placeholder="Search all apps…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: "16px" }} />
          <div className="apps-grid apps-grid--5">
            {filtered.map(app => {
              const added = myIds.has(app.id);
              return (
                <div key={app.id} className="app-tile">
                  <a href={app.href} target="_blank" rel="noopener noreferrer" className="app-body">
                    <AppIcon app={app} />
                    <div className="app-name">{app.name}</div>
                  </a>
                  <div className="app-actions">
                    <button className="au-btn au-btn-primary" disabled={added} onClick={() => onAdd(app)}>
                      {added ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function App() {
  const [route, setRoute] = useState("loading");
  const [me, setMe] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("All Apps");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setRoute("login"); return; }
      const user = session.user;
      const [{ data: apps }, { data: rows }] = await Promise.all([
        supabase.from("apps").select("id,name,href,site_url,folder,is_active").eq("is_active", true),
        supabase.from("user_apps").select("app_id").eq("user_id", user.id),
      ]);
      const mySet = new Set((rows || []).map(r => r.app_id));
      setCatalog(apps || []);
      setMyApps((apps || []).filter(a => mySet.has(a.id)));
      const uniqueFolders = [...new Set((apps || []).map(a => a.folder || "Unsorted"))];
      uniqueFolders.sort();
      uniqueFolders.push("All Apps");
      setFolders(uniqueFolders);
      setMe({ id: user.id, email: user.email });
      setRoute("dashboard");
    })();
  }, []);

  async function onAdd(app) {
    await supabase.from("user_apps").insert({ user_id: me.id, app_id: app.id });
    setMyApps(prev => [...prev, app]);
  }
  async function onLogout() {
    await supabase.auth.signOut();
    setMe(null);
    setRoute("login");
  }

  if (route === "dashboard") {
    return <DashboardPage me={me} myApps={myApps} setFolder={setCurrentFolder} currentFolder={currentFolder} search={search} setSearch={setSearch} folders={folders} onStore={() => setRoute("store")} onLogout={onLogout} />;
  }
  if (route === "store") {
    return <StorePage catalog={catalog} myApps={myApps} setFolder={setCurrentFolder} currentFolder={currentFolder} search={search} setSearch={setSearch} folders={folders} onAdd={onAdd} onLogout={onLogout} />;
  }
  if (route === "login") {
    return (
      <Shell>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <h2>Login Placeholder</h2>
          {/* Replace with your styled login/signup */}
        </div>
      </Shell>
    );
  }
  return <div>Loading…</div>;
}

const mount = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
const rootEl = document.getElementById("auth-root");
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootEl).render(mount);
} else {
  ReactDOM.render(mount, rootEl);
}

export default App;

