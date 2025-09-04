console.log("✅ auth-app.jsx loaded");

/* auth-app.jsx — Apps-United (Supabase Auth + Sidebar + Store + Grid Settings + Favicons) */
/* global React, ReactDOM, window */
const { useState, useEffect, useMemo, Component } = React;

const SUPABASE_URL = "https://pvfxettbmykvezwahohh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZnhldHRibXlrdmV6d2Fob2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTc2MzMsImV4cCI6MjA3MjMzMzYzM30.M5V-N3jYDs1Eijqb6ZjscNfEOSMMARe8HI20sRdAOTQ";
const PUBLIC_BUCKET = "app-logos";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error("Supabase client script missing.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

/* ---------- Overrides + helpers ---------- */
const OVERRIDES = { "Hellotickets": "hellotickets.jpeg", "Agoda": "agoda.jpeg", "Viator": "viator.jpeg" /* … more */ };
function bucketURL(f){ return `${SUPABASE_URL}/storage/v1/object/public/${PUBLIC_BUCKET}/${encodeURIComponent(f)}`; }
function filenameGuesses(name){ if(!name) return []; const exts=[".png",".jpg",".jpeg",".JPG",".JPEG"]; return exts.map(e=>`${name}${e}`); }
function googleFavicon(h,size=128){ try{const host=new URL(h).hostname; return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;}catch{return null;} }

/* ---------- AppIcon ---------- */
function AppIcon({ app, size=54, radius=14 }) {
  const [idx,setIdx]=useState(0);
  const candidates=useMemo(()=>{
    const arr=[]; if(app?.icon_url)arr.push(app.icon_url); if(app?.logo_url)arr.push(app.logo_url);
    const o=OVERRIDES[app?.name||""]; if(o)arr.push(bucketURL(o));
    filenameGuesses(app?.name).forEach(g=>arr.push(bucketURL(g)));
    if(app?.href){const g=googleFavicon(app.href,size*2);if(g)arr.push(g);}
    if(app?.href){try{arr.push(`${new URL(app.href).origin}/favicon.ico`);}catch{}}
    return [...new Set(arr)];
  },[app,size]);
  const cur=candidates[idx]; const last=idx>=candidates.length-1;
  function onErr(){ if(!last) setIdx(i=>i+1); }
  if(!candidates.length) return <div className="app-icon" style={{width:size,height:size,borderRadius:radius}}><span>{(app?.name||"?")[0]}</span></div>;
  return <img src={cur} width={size} height={size} style={{borderRadius:radius,objectFit:"cover"}} onError={onErr} />;
}

/* ---------- Error boundary ---------- */
class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error("Apps-United error:", error, info); }
  render(){
    if (this.state.error) {
      return (
        <div style={{background:"#111",color:"red",padding:"20px"}}>
          <h2>⚠️ Crash in Apps-United</h2>
          <pre>{this.state.error.message || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- Session helpers ---------- */
const THIRTY_DAYS=30*24*60*60*1000;const LS_LAST="appsUnited.lastActive";
function bump(){localStorage.setItem(LS_LAST,String(Date.now()));}
function recent(){const t=parseInt(localStorage.getItem(LS_LAST)||"0",10);return t&&(Date.now()-t)<THIRTY_DAYS;}

/* ---------- Shell ---------- */
function Shell({children}){return <div className="au-container">{children}</div>;}

/* ---------- Sidebar with settings ---------- */
function Sidebar({folders,currentFolder,setFolder,collapsed,setCollapsed,onStore,onLogout,search,setSearch,grid,setGrid}) {
  const [showSettings,setShowSettings]=useState(false);
  return (
    <div style={{width:collapsed?"60px":"220px",background:"var(--bg-2)",padding:"10px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div>
        <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
          <button className="au-btn au-btn-secondary" onClick={()=>setCollapsed(!collapsed)}>{collapsed?"☰":"⮜"}</button>
          {!collapsed && <button className="au-btn au-btn-secondary" onClick={()=>setShowSettings(!showSettings)}>⚙️</button>}
        </div>
        {showSettings && !collapsed && (
          <div style={{marginBottom:12}}>
            <div className="au-note">Grid size</div>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              {["4","5","6"].map(n=><button key={n} className={`au-btn ${grid===n?"au-btn-primary":"au-btn-secondary"}`} onClick={()=>setGrid(n)}>{n}×</button>)}
            </div>
          </div>
        )}
        {!collapsed && (
          <>
            <input className="au-input" placeholder="Search apps…" value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}} />
            {folders.map(f=><button key={f} className={`au-btn ${currentFolder===f?"au-btn-primary":"au-btn-secondary"}`} style={{marginBottom:6}} onClick={()=>setFolder(f)}>{f}</button>)}
            <button className="au-btn au-btn-secondary" style={{marginTop:8}} onClick={onStore}>🛍️ App Store</button>
          </>
        )}
      </div>
      {!collapsed && <button className="au-btn au-btn-secondary" onClick={onLogout}>Logout</button>}
    </div>
  );
}

/* ---------- Login / Signup ---------- */
function LoginPage({err,form,setForm,onSubmit,goSignup}) {
  return (
    <Shell>
      <div className="au-card" style={{maxWidth:420,margin:"40px auto",padding:16}}>
        <h2>Sign in</h2>{err&&<div className="au-error">{err}</div>}
        <form onSubmit={onSubmit} className="au-grid" style={{gap:16}}>
          <input className="au-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))} required/>
          <input className="au-input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(s=>({...s,password:e.target.value}))} required/>
          <label><input type="checkbox" checked={form.stay} onChange={e=>setForm(s=>({...s,stay:e.target.checked}))}/> Stay signed in 30 days</label>
          <button className="au-btn au-btn-primary" type="submit">Sign in</button>
          <button type="button" className="au-btn au-btn-secondary" onClick={goSignup}>Create account</button>
        </form>
      </div>
    </Shell>
  );
}
function SignupPage({err,form,setForm,onSubmit,goLogin}) {
  return (
    <Shell>
      <div className="au-card" style={{maxWidth:420,margin:"40px auto",padding:16}}>
        <h2>Create account</h2>{err&&<div className="au-error">{err}</div>}
        <form onSubmit={onSubmit} className="au-grid" style={{gap:16}}>
          <input className="au-input" placeholder="Full name" value={form.fullName} onChange={e=>setForm(s=>({...s,fullName:e.target.value}))}/>
          <input className="au-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))}/>
          <input className="au-input" type="password" placeholder="Password" value={form.password} onChange={e=>setForm(s=>({...s,password:e.target.value}))}/>
          <input className="au-input" type="password" placeholder="Confirm password" value={form.confirm} onChange={e=>setForm(s=>({...s,confirm:e.target.value}))}/>
          <button className="au-btn au-btn-primary" type="submit">Create</button>
          <button type="button" className="au-btn au-btn-secondary" onClick={goLogin}>Already have account</button>
        </form>
      </div>
    </Shell>
  );
}

/* ---------- Dashboard ---------- */
function DashboardPage({myApps,folders,currentFolder,setFolder,search,setSearch,onStore,onLogout,grid,setGrid}) {
  const filtered=myApps.filter(a=>(currentFolder==="All Apps"||a.folder===currentFolder)&&(!search||a.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar folders={folders} currentFolder={currentFolder} setFolder={setFolder} collapsed={false} setCollapsed={()=>{}} onStore={onStore} onLogout={onLogout} search={search} setSearch={setSearch} grid={grid} setGrid={setGrid}/>
      <div style={{flex:1,padding:20}}>
        <div className={`apps-grid apps-grid--${grid}`}>
          {filtered.map(app=><div key={app.id} className="app-tile"><a href={app.href} target="_blank" rel="noopener" className="app-body"><AppIcon app={app}/><div className="app-name">{app.name}</div></a></div>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Store ---------- */
function StorePage({catalog,myApps,onAdd,folders,currentFolder,setFolder,search,setSearch,onLogout,grid,setGrid}) {
  const myIds=new Set(myApps.map(a=>a.id));
  const filtered=catalog.filter(a=>(currentFolder==="All Apps"||a.folder===currentFolder)&&(!search||a.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar folders={folders} currentFolder={currentFolder} setFolder={setFolder} collapsed={false} setCollapsed={()=>{}} onStore={()=>{}} onLogout={onLogout} search={search} setSearch={setSearch} grid={grid} setGrid={setGrid}/>
      <div style={{flex:1,padding:20}}>
        <div className={`apps-grid apps-grid--${grid}`}>
          {filtered.map(app=><div key={app.id} className="app-tile"><a href={app.href} target="_blank" rel="noopener" className="app-body"><AppIcon app={app}/><div className="app-name">{app.name}</div></a><button className="au-btn au-btn-primary" disabled={myIds.has(app.id)} onClick={()=>onAdd(app)}>{myIds.has(app.id)?"Added":"Add"}</button></div>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- App Router ---------- */
function App() {
  const [route,setRoute]=useState("loading"),[err,setErr]=useState(""),[loginForm,setLoginForm]=useState({email:"",password:"",stay:true}),[signupForm,setSignupForm]=useState({fullName:"",email:"",password:"",confirm:""}),[me,setMe]=useState(null),[catalog,setCatalog]=useState([]),[myApps,setMyApps]=useState([]),[folders,setFolders]=useState([]),[currentFolder,setCurrentFolder]=useState("All Apps"),[search,setSearch]=useState(""),[grid,setGrid]=useState("5");
  useEffect(()=>{(async()=>{const{data:{session}}=await supabase.auth.getSession();if(!session){setRoute("login");return;}if(!recent()){await supabase.auth.signOut();setRoute("login");return;}bump();setMe(session.user);const[{data:apps},{data:rows}]=await Promise.all([supabase.from("apps").select("id,name,href,folder,is_active").eq("is_active",true),supabase.from("user_apps").select("app_id").eq("user_id",session.user.id)]);const set=new Set((rows||[]).map(r=>r.app_id));setCatalog(apps||[]);setMyApps((apps||[]).filter(a=>set.has(a.id)));setFolders(["All Apps",...new Set((apps||[]).map(a=>a.folder||"Unsorted"))]);setRoute("dashboard");})();},[]);
  async function onAdd(app){await supabase.from("user_apps").insert({user_id:me.id,app_id:app.id});setMyApps(p=>[...p,app]);}
  async function onLogout(){await supabase.auth.signOut();setMe(null);setRoute("login");}
  async function handleLogin(e){e.preventDefault();setErr("");try{const{error}=await supabase.auth.signInWithPassword({email:loginForm.email,password:loginForm.password});if(error)throw error;bump();setRoute("dashboard");}catch(e){setErr(e.message||"Login failed.");}}
  async function handleSignup(e){e.preventDefault();setErr("");try{if(signupForm.password!==signupForm.confirm)throw new Error("Passwords do not match");const{error}=await supabase.auth.signUp({email:signupForm.email,password:signupForm.password,options:{data:{full_name:signupForm.fullName}}});if(error)throw error;bump();setRoute("dashboard");}catch(e){setErr(e.message||"Signup failed.");}}
  if(route==="login")return<LoginPage err={err} form={loginForm} setForm={setLoginForm} onSubmit={handleLogin} goSignup={()=>setRoute("signup")}/>;
  if(route==="signup")return<SignupPage err={err} form={signupForm} setForm={setSignupForm} onSubmit={handleSignup} goLogin={()=>setRoute("login")}/>;
  if(route==="dashboard")return<DashboardPage myApps={myApps} folders={folders} currentFolder={currentFolder} setFolder={setCurrentFolder} search={search} setSearch={setSearch} onStore={()=>setRoute("store")} onLogout={onLogout} grid={grid} setGrid={setGrid}/>;
  if(route==="store")return<StorePage catalog={catalog} myApps={myApps} onAdd={onAdd} folders={folders} currentFolder={currentFolder} setFolder={setCurrentFolder} search={search} setSearch={setSearch} onLogout={onLogout} grid={grid} setGrid={setGrid}/>;
  return<div>Loading…</div>;
}

/* ---------- Mount ---------- */
const mount=<ErrorBoundary><App/></ErrorBoundary>;
const root=document.getElementById("auth-root"); (ReactDOM.createRoot?ReactDOM.createRoot(root):ReactDOM).render(mount);


