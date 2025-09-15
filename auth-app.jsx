const { useState, useEffect, useMemo, Component } = React;

/* Error Boundary */
class ErrorBoundary extends Component {
  constructor(p){ super(p); this.state={error:null}; }
  static getDerivedStateFromError(e){ return { error:e }; }
  componentDidCatch(e,i){ console.error("Apps-United error:", e, i); }
  render(){
    if(this.state.error){
      return <div className="au-container"><div className="au-card">Something went wrong. Check console.</div></div>;
    }
    return this.props.children;
  }
}

/* Helpers */
const LS_USERS="appsUnited.users", LS_SESSION="appsUnited.session";
const THIRTY_DAYS=30*24*60*60*1000;
const demoHash = s=>"hash_"+btoa(unescape(encodeURIComponent(s))).replace(/=/g,"");
function loadUsers(){ try{return JSON.parse(localStorage.getItem(LS_USERS)||"[]");}catch{return[];} }
function saveUsers(u){ localStorage.setItem(LS_USERS,JSON.stringify(u)); }
function loadSession(){ try{return JSON.parse(localStorage.getItem(LS_SESSION)||"null");}catch{return null;} }
function saveSession(s){ localStorage.setItem(LS_SESSION,JSON.stringify(s)); }
function clearSession(){ localStorage.removeItem(LS_SESSION); }
function getUserByEmail(e){ return loadUsers().find(u=>u.email.toLowerCase()===(e||"").toLowerCase()); }
function upsertUser(user){ const users=loadUsers(); const i=users.findIndex(u=>u.email.toLowerCase()===user.email.toLowerCase()); if(i>=0)users[i]=user;else users.push(user); saveUsers(users);}
function isSessionFresh(s,n=Date.now()){return s && s.persistent && (n-(s.lastActive||0))<THIRTY_DAYS;}

/* Starter apps */
const defaultApps=[
  {id:"app1",name:"App One",desc:"Your first starter app.",badge:"Starter"},
  {id:"app2",name:"App Two",desc:"Another placeholder app.",badge:"Starter"},
  {id:"app3",name:"App Three",desc:"Ready for future features.",badge:"Starter"},
  {id:"app4",name:"App Four",desc:"Customize this later.",badge:"Starter"},
];

/* Shared UI */
function Shell({route,onLogout,children}){
  return (
    <div className="au-container">
      <header className="au-header">
        <div className="au-brand" style={{flexDirection:"column",alignItems:"center",textAlign:"center"}}>
          <img src="./favicon-192.png" alt="logo" style={{width:64,height:64,borderRadius:16}}/>
          <div style={{marginTop:6}}>
            <div className="au-subtle" style={{fontWeight:600}}>Apps-United</div>
            <div className="au-note">All your apps, your way.</div>
          </div>
        </div>
        {route==="dashboard"&&<button className="au-btn au-btn-secondary" onClick={onLogout}>Logout</button>}
      </header>
      {children}
    </div>
  );
}
const ErrorNote=({children})=><div className="au-card" style={{background:"rgba(248,113,113,.12)",borderColor:"rgba(248,113,113,.5)",marginBottom:8,padding:12}}>⚠️ {children}</div>;

/* Pages */
function LoginPage({err,form,setForm,onSubmit,goSignup,route,onLogout}){
  return <Shell route={route} onLogout={onLogout}>
    <div className="au-grid" style={{maxWidth:520,margin:"0 auto"}}>
      <div className="au-card">
        <h2>Sign in</h2>
        {err&&<ErrorNote>{err}</ErrorNote>}
        <form onSubmit={onSubmit} className="au-grid">
          <div><label>Email</label>
            <input className="au-input" type="email" value={form.email}
              onChange={e=>setForm(s=>({...s,email:e.target.value}))} placeholder="you@example.com"/>
          </div>
          <div><label>Password</label>
            <input className="au-input" type="password" value={form.password}
              onChange={e=>setForm(s=>({...s,password:e.target.value}))} placeholder="••••••••"/>
          </div>
          <div className="au-row-between">
            <label className="au-row">
              <input type="checkbox" checked={form.stay}
                onChange={e=>setForm(s=>({...s,stay:e.target.checked}))}/> Stay signed in
            </label>
            <button type="button" className="au-btn au-btn-secondary" onClick={goSignup}>Create account</button>
          </div>
          <button type="submit" className="au-btn au-btn-primary">Sign in</button>
        </form>
      </div>
    </div>
  </Shell>;
}

function SignupPage({err,form,setForm,onSubmit,goLogin,route,onLogout}){
  return <Shell route={route} onLogout={onLogout}>
    <div className="au-grid" style={{maxWidth:720,margin:"0 auto"}}>
      <div className="au-card">
        <h2>Create account</h2>
        {err&&<ErrorNote>{err}</ErrorNote>}
        <form onSubmit={onSubmit} className="au-grid">
          <input className="au-input" placeholder="Full name" value={form.fullName}
            onChange={e=>setForm(s=>({...s,fullName:e.target.value}))}/>
          <input className="au-input" type="email" placeholder="you@example.com" value={form.email}
            onChange={e=>setForm(s=>({...s,email:e.target.value}))}/>
          <input className="au-input" type="password" placeholder="Password" value={form.password}
            onChange={e=>setForm(s=>({...s,password:e.target.value}))}/>
          <input className="au-input" type="password" placeholder="Confirm password" value={form.confirm}
            onChange={e=>setForm(s=>({...s,confirm:e.target.value}))}/>
          <label className="au-row"><input type="checkbox" checked={form.agree}
            onChange={e=>setForm(s=>({...s,agree:e.target.checked}))}/> I agree to Terms</label>
          <label className="au-row"><input type="checkbox" checked={form.optIn}
            onChange={e=>setForm(s=>({...s,optIn:e.target.checked}))}/> Send me updates</label>
          <div className="au-row"><button type="submit" className="au-btn au-btn-primary">Create</button>
          <button type="button" className="au-btn au-btn-secondary" onClick={goLogin}>I already have an account</button></div>
        </form>
      </div>
    </div>
  </Shell>;
}

function DashboardPage({me,route,onLogout}){
  const apps=useMemo(()=>me?.apps?.length?me.apps:defaultApps,[me]);
  return <Shell route={route} onLogout={onLogout}>
    <h2>Welcome {me?.fullName?.split(" ")[0]||""} 👋</h2>
    <div className="au-grid au-grid-3">
      {apps.map(a=><div key={a.id} className="au-card">
        <div className="au-subtle">{a.name}</div>
        <div className="au-note">{a.desc}</div>
        <button className="au-btn au-btn-primary">Open</button>
      </div>)}
    </div>
  </Shell>;
}

/* Router App */
function App(){
  const [route,setRoute]=useState("loading");
  const [err,setErr]=useState("");
  const [loginForm,setLoginForm]=useState({email:"",password:"",stay:true});
  const [signupForm,setSignupForm]=useState({fullName:"",email:"",password:"",confirm:"",agree:false,optIn:true});
  const [me,setMe]=useState(null);

  useEffect(()=>{ const s=loadSession();
    if(!isSessionFresh(s)){clearSession();setRoute("login");return;}
    const u=getUserByEmail(s.email); if(!u){clearSession();setRoute("login");return;}
    saveSession({...s,lastActive:Date.now()}); setMe(u); setRoute("dashboard");
  },[]);

  function handleLogin(e){ e.preventDefault(); setErr("");
    const u=getUserByEmail(loginForm.email||""); if(!u) return setErr("No account.");
    if(u.passwordHash!==demoHash(loginForm.password)) return setErr("Wrong password.");
    saveSession({email:u.email,lastActive:Date.now(),persistent:!!loginForm.stay});
    setMe(u); setRoute("dashboard"); }

  function handleSignup(e){ e.preventDefault(); setErr("");
    const {fullName,email,password,confirm,agree,optIn}=signupForm;
    if(!fullName.trim()) return setErr("Enter name.");
    if(!/\S+@\S+\.\S+/.test(email)) return setErr("Bad email.");
    if(password.length<8) return setErr("Min 8 chars.");
    if(password!==confirm) return setErr("Passwords don't match.");
    if(!agree) return setErr("Agree to Terms.");
    if(getUserByEmail(email)) return setErr("Email exists.");
    const u={fullName:fullName.trim(),email:email.trim(),passwordHash:demoHash(password),optIn,apps:[...defaultApps]};
    upsertUser(u); saveSession({email:u.email,lastActive:Date.now(),persistent:true}); setMe(u); setRoute("dashboard"); }

  function handleLogout(){ clearSession(); setMe(null); setRoute("login"); }

  if(route==="loading") return <div className="au-container">Loading…</div>;
  if(route==="login") return <LoginPage err={err} form={loginForm} setForm={setLoginForm} onSubmit={handleLogin} goSignup={()=>{setErr("");setRoute("signup");}} route={route} onLogout={handleLogout}/>;
  if(route==="signup") return <SignupPage err={err} form={signupForm} setForm={setSignupForm} onSubmit={handleSignup} goLogin={()=>{setErr("");setRoute("login");}} route={route} onLogout={handleLogout}/>;
  return <DashboardPage me={me} route={route} onLogout={handleLogout}/>;
}

/* Mount */
ReactDOM.createRoot(document.getElementById("auth-root")).render(<ErrorBoundary><App/></ErrorBoundary>);
