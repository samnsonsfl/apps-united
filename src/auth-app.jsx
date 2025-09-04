/* src/auth-app.jsx — Apps-United (Supabase + Auto-Favicons + Debug Logs) */
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pvfxettbmykvezwahohh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZnhldHRibXlrdmV6d2Fob2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTc2MzMsImV4cCI6MjA3MjMzMzYzM30.M5V-N3jYDs1Eijqb6ZjscNfEOSMMARe8HI20sRdAOTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================== AppIcon ================== */
function AppIcon({ app, size = 54 }) {
  if (!app?.href) {
    // If no URL, fallback to first letter of name
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: "#1e293b",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: size * 0.5,
        }}
      >
        {(app?.name || "?")[0]}
      </div>
    );
  }

  // Build favicon URLs
  const domain = new URL(app.href).hostname;
  const googleFavicon = `https://www.google.com/s2/favicons?sz=${size * 2}&domain=${domain}`;
  const siteFavicon = `${new URL(app.href).origin}/favicon.ico`;

  const [iconSrc, setIconSrc] = React.useState(googleFavicon);

  return (
    <img
      src={iconSrc}
      alt={app.name}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        objectFit: "cover",
      }}
      onError={() => setIconSrc(siteFavicon)} // fallback if Google fails
    />
  );
}

/* ================== App Component ================== */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("✅ App component mounted");
    async function loadData() {
      try {
        console.log("🔍 Fetching apps from Supabase…");
        const { data, error } = await supabase
          .from("apps")
          .select("id, name, href, is_active")
          .eq("is_active", true);

        if (error) {
          console.error("❌ Supabase error:", error.message);
          setError(error.message);
          return;
        }

        console.log("✅ Apps loaded:", data);
        setApps(data || []);
      } catch (err) {
        console.error("💥 Fetch failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div> Loading apps…</div>;
  if (error) return <div> Error: {error}</div>;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1>Apps-United Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 100px)",
          gap: 16,
        }}
      >
        {apps.map((app) => (
          <div key={app.id} style={{ textAlign: "center" }}>
            <AppIcon app={app} />
            <div style={{ fontSize: 12, marginTop: 6 }}>{app.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
