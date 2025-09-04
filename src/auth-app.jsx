/* src/auth-app.jsx — Apps-United (Auth + Sidebar Folders + Auto-Favicons) */
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pvfxettbmykvezwahohh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZnhldHRibXlrdmV6d2Fob2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTc2MzMsImV4cCI6MjA3MjMzMzYzM30.M5V-N3jYDs1Eijqb6ZjscNfEOSMMARe8HI20sRdAOTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================== AppIcon ================== */
function AppIcon({ app, size = 54 }) {
  const [iconSrc, setIconSrc] = React.useState(null);
  const [failed, setFailed] = React.useState(false);

  let baseUrl = app?.site_url || app?.href;
  if (!baseUrl) {
    return (
      <div className="app-icon">
        <span className="app-letter">{(app?.name || "?")[0]}</span>
      </div>
    );
  }
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = "https://" + baseUrl;
  }

  const domain = new URL(baseUrl).hostname;
  const googleFavicon = `https://www.google.com/s2/favicons?sz=${size * 2}&domain=${domain}`;
  const siteFavicon = `${new URL(baseUrl).origin}/favicon.ico`;

  React.useEffect(() => {
    setIconSrc(googleFavicon);
  }, [googleFavicon]);

  if (failed) {
    return (
      <div className="app-icon">
        <span className="app-letter">{(app?.name || "?")[0]}</span>
      </div>
    );
  }

  return (
    <img
      src={iconSrc}
      alt={app.name}
      className="app-icon__img"
      onError={() => {
        if (iconSrc === googleFavicon) {
          setIconSrc(siteFavicon);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

/* ================== Sidebar ================== */
function Sidebar({ folders, currentFolder, setFolder }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="au-sidebar"
      style={{
        width: collapsed ? "60px" : "200px",
        background: "var(--bg-2)",
        padding: "10px",
        borderRight: "1px solid var(--border)",
      }}
    >
      <button
        className="au-btn au-btn-secondary"
        onClick={() => setCollapsed(!collapsed)}
        style={{ marginBottom: "12px", width: "100%" }}
      >
        {collapsed ? "☰" : "⮜ Hide"}
      </button>

      <div className="au-grid" style={{ gap: "8px" }}>
        {folders
          .filter((f) => f !== "All Apps")
          .map((folder) => (
            <button
              key={folder}
              className={`au-folderchip ${
                currentFolder === folder ? "is-active" : ""
              }`}
              onClick={() => setFolder(folder)}
            >
              {folder}
            </button>
          ))}
        {/* All Apps last */}
        {folders.includes("All Apps") && (
          <button
            key="All Apps"
            className={`au-folderchip ${
              currentFolder === "All Apps" ? "is-active" : ""
            }`}
            onClick={() => setFolder("All Apps")}
          >
            All Apps
          </button>
        )}
      </div>
    </div>
  );
}

/* ================== App Component ================== */
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [error, setError] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("apps")
          .select("id, name, href, site_url, folder, is_active")
          .eq("is_active", true);

        if (error) {
          setError(error.message);
          return;
        }
        setApps(data || []);

        // Pick first real folder as default
        const folders = [
          ...new Set(data.map((app) => app.folder || "Unsorted")),
        ];
        folders.sort();
        if (folders.length > 0) {
          setCurrentFolder(folders[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (session) loadData();
  }, [session]);

  if (!session) {
    return (
      <div className="au-container" data-route="login">
        <div className="au-header">
          <h1 className="au-brand">Apps-United Login</h1>
        </div>
        <div className="au-card au-card-content">
          <LoginForm />
        </div>
      </div>
    );
  }

  if (loading) return <div className="au-container">Loading apps…</div>;
  if (error) return <div className="au-container au-error">Error: {error}</div>;

  const folders = [
    ...new Set(apps.map((a) => (a.folder ? a.folder : "Unsorted"))),
  ];
  folders.sort();
  folders.push("All Apps"); // ensure All Apps is last

  const visibleApps =
    currentFolder === "All Apps"
      ? apps
      : apps.filter((a) => (a.folder || "Unsorted") === currentFolder);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        folders={folders}
        currentFolder={currentFolder}
        setFolder={setCurrentFolder}
      />

      <div className="au-container" data-route="dashboard" style={{ flex: 1 }}>
        <div className="au-header">
          <h1 className="au-brand">Apps-United Dashboard</h1>
          <button
            className="au-btn au-btn-secondary au-logout"
            onClick={() => supabase.auth.signOut()}
          >
            Logout
          </button>
          <button
            className="au-btn au-btn-secondary"
            style={{ marginLeft: "12px" }}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="apps-grid apps-grid--5">
          {visibleApps.map((app) => (
            <div key={app.id} className="app-tile">
              <a
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="app-body"
              >
                <div className="app-icon">
                  <AppIcon app={app} />
                </div>
                <div className="app-name">{app.name}</div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================== LoginForm ================== */
function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="au-grid-3">
      <input
        type="email"
        className="au-input"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button className="au-btn au-btn-primary" disabled={loading}>
        {loading ? "Sending…" : "Send magic link"}
      </button>
      {message && <p className="au-note">{message}</p>}
    </form>
  );
}
