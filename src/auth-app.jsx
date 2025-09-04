console.log("✅ auth-app.jsx loaded");

/* auth-app.jsx — Apps-United (Supabase Auth + Sidebar + Store + Grid Settings + Favicons) */
/* global React, window */
import React, { useState, useEffect, useMemo, Component } from "react";

const SUPABASE_URL = "https://pvfxettbmykvezwahohh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZnhldHRibXlrdmV6d2Fob2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTc2MzMsImV4cCI6MjA3MjMzMzYzM30.M5V-N3jYDs1Eijqb6ZjscNfEOSMMARe8HI20sRdAOTQ";
const PUBLIC_BUCKET = "app-logos";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

/* ---------- Helpers, AppIcon, ErrorBoundary, Sidebar, LoginPage, SignupPage, DashboardPage, StorePage ---------- */
/* (keep all the code you already have for these pieces) */

/* ---------- App Router ---------- */
function App() {
  const [route, setRoute] = useState("loading");
  const [err, setErr] = useState("");
  const [loginForm, setLoginForm] = useState({ email:"", password:"", stay:true });
  const [signupForm, setSignupForm] = useState({ fullName:"", email:"", password:"", confirm:"" });
  const [me, setMe] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("All Apps");
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState("5");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setRoute("login"); return; }
      setMe(session.user);

      const [{ data: apps }, { data: rows }] = await Promise.all([
        supabase.from("apps").select("id,name,href,folder,is_active").eq("is_active",true),
        supabase.from("user_apps").select("app_id").eq("user_id",session.user.id)
      ]);

      const setIds = new Set((rows||[]).map(r => r.app_id));
      setCatalog(apps || []);
      setMyApps((apps||[]).filter(a => setIds.has(a.id)));
      setFolders(["All Apps", ...new Set((apps||[]).map(a => a.folder || "Unsorted"))]);
      setRoute("dashboard");
    })();
  }, []);

  async function handleLogin(e){
    e.preventDefault(); setErr("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
      if (error) throw error;
      setRoute("dashboard");
    } catch (e) { setErr(e.message || "Login failed."); }
  }

  async function handleSignup(e){
    e.preventDefault(); setErr("");
    try {
      if (signupForm.password !== signupForm.confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: { data: { full_name: signupForm.fullName } }
      });
      if (error) throw error;
      setRoute("dashboard");
    } catch (e) { setErr(e.message || "Signup failed."); }
  }

  async function onLogout(){ await supabase.auth.signOut(); setMe(null); setRoute("login"); }
  async function onAdd(app){ await supabase.from("user_apps").insert({ user_id: me.id, app_id: app.id }); setMyApps(p=>[...p,app]); }

  if (route === "loading") return <div style={{color:"white",padding:20,fontSize:20}}>⏳ Loading Apps-United…</div>;
  if (route === "login") return <LoginPage err={err} form={loginForm} setForm={setLoginForm} onSubmit={handleLogin} goSignup={()=>setRoute("signup")} />;
  if (route === "signup") return <SignupPage err={err} form={signupForm} setForm={setSignupForm} onSubmit={handleSignup} goLogin={()=>setRoute("login")} />;
  if (route === "dashboard") return <DashboardPage myApps={myApps} folders={folders} currentFolder={currentFolder} setFolder={setCurrentFolder} search={search} setSearch={setSearch} onStore={()=>setRoute("store")} onLogout={onLogout} grid={grid} setGrid={setGrid} />;
  if (route === "store") return <StorePage catalog={catalog} myApps={myApps} onAdd={onAdd} folders={folders} currentFolder={currentFolder} setFolder={setCurrentFolder} search={search} setSearch={setSearch} onLogout={onLogout} grid={grid} setGrid={setGrid} />;
  return <div style={{color:"white",padding:20}}>Loading…</div>;
}

/* ✅ Export only — no mounting here */
export default App;
