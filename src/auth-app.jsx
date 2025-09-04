/* src/auth-app.jsx — Apps-United (Supabase + Auto-Favicons + Debug Logs + site_url support) */
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

  // Decide which URL to use for favicon (prefer site_url if available)
  let baseUrl = app?.site_url || app?.href;
  if (!baseUrl) {
    // Final fallback: no URL at all → show first letter
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

  // Ensure URL has protocol
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = "https://" + baseUrl;
  }

  const domain = new URL(baseUrl).hostname;
  const googleFavicon = `https://www.google.com/s2/favicons?sz=${size * 2}&domain=${domain}`;
  const siteFavicon = `${new URL(baseUrl).origin}/favicon.ico`;

  // Initialize icon
  React.useEffect(() => {
    setIconSrc(googleFavicon);
  }, [googleFavicon]);

  if (failed) {
    // Show letter fallback if all favicons fail
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
      onError={() => {
        if (iconSrc === googleFavicon) {
          console.warn("Google favicon failed for:", domain, "→ trying site favicon");
          setIconSrc(siteFavicon);
        } else {
          console.warn("Both favicon attempts failed for:", domain);
          setFailed(true);
        }
      }}
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
          .select("id, name, href, site_url, is_active")
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
            {/* AppIcon uses site_url for favicon, href remains your affiliate link */}
            <a href={app.href} target="_blank" rel="noopener noreferrer">
              <AppIcon app={app} />
            </a>
            <div style={{ fontSize: 12, marginTop: 6 }}>{app.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
