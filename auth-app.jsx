/* auth-app.jsx — Apps-United login, signup, dashboard (CDN React, no build) */
const { useState, useEffect, useMemo, Component } = React;

/* -------------------- Supabase Init -------------------- */
const SUPABASE_URL = "https://pvfxettbmykvezwahohh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZnhldHRibXlrdmV6d2Fob2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTc2MzMsImV4cCI6MjA3MjMzMzYzM30.M5V-N3jYDs1Eijqb6ZjscNfEOSMMARe8HI20sRdAOTQ";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* -------------------- Error Boundary -------------------- */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Apps-United error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="au-container" style={{ paddingTop: 40 }}>
          <div
            className="au-card"
            style={{
              padding: 16,
              borderColor: "rgba(248,113,113,.5)",
              background: "rgba(248,113,113,.12)",
            }}
          >
            <h2 style={{ margin: "6px 0 8px", fontWeight: 700 }}>
              Something went wrong
            </h2>
            <div className="au-note">
              Open your browser console to see details.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* -------------------- Starter apps -------------------- */
const defaultApps = [
  {
    id: "app1",
    name: "App One",
    desc: "Your first starter app.",
    badge: "Starter",
  },
  {
    id: "app2",
    name: "App Two",
    desc: "Another placeholder app.",
    badge: "Starter",
  },
  {
    id: "app3",
    name: "App Three",
    desc: "Ready for future features.",
    badge: "Starter",
  },
  {
    id: "app4",
    name: "App Four",
    desc: "Customize this later.",
    badge: "Starter",
  },
];

/* -------------------- Shell & small UI -------------------- */
function Shell({ route, onLogout, children }) {
  return (
    <div className="au-container">
      <header className="au-header" style={{ alignItems: "flex-start" }}>
        <div
          className="au-brand"
          style={{ flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          <img
            src="./favicon-192.png"
            alt="Apps-United logo"
            style={{ width: 64, height: 64, borderRadius: 16 }}
          />
          <div style={{ marginTop: 6 }}>
            <div className="au-subtle" style={{ fontWeight: 600 }}>
              Apps-United
            </div>
            <div className="au-note">All your apps, your way.</div>
          </div>
        </div>
        {route === "dashboard" && (
          <button className="au-btn au-btn-secondary" onClick={onLogout}>
            Logout
          </button>
        )}
      </header>
      {children}
    </div>
  );
}

function ErrorNote({ children }) {
  return (
    <div
      className="au-card"
      style={{
        borderColor: "rgba(248,113,113,.5)",
        background: "rgba(248,113,113,.12)",
        padding: 12,
        marginBottom: 8,
      }}
    >
      <span>⚠️</span> <span style={{ marginLeft: 8 }}>{children}</span>
    </div>
  );
}

/* -------------------- Login Page -------------------- */
function LoginPage({ err, form, setForm, onSubmit, goSignup, route, onLogout }) {
  return (
    <Shell route={route} onLogout={onLogout}>
      <div className="au-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="au-card">
          <div className="au-card-header">
            <h2 style={{ margin: 0, fontWeight: 600 }}>Sign in</h2>
          </div>
          <div className="au-card-content">
            {err && <ErrorNote>{err}</ErrorNote>}
            <form onSubmit={onSubmit} className="au-grid" style={{ gap: 16 }}>
              <div>
                <label className="au-note">Email</label>
                <input
                  className="au-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="au-note">Password</label>
                <input
                  className="au-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, password: e.target.value }))
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="au-row-between" style={{ marginTop: 4 }}>
                <button
                  type="button"
                  className="au-btn au-btn-secondary"
                  onClick={goSignup}
                >
                  Create account
                </button>
                <button type="submit" className="au-btn au-btn-primary">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* -------------------- Signup Page -------------------- */
function SignupPage({ err, form, setForm, onSubmit, goLogin, route, onLogout }) {
  return (
    <Shell route={route} onLogout={onLogout}>
      <div className="au-grid" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="au-card">
          <div className="au-card-header">
            <h2 style={{ margin: 0, fontWeight: 600 }}>Create your account</h2>
          </div>
          <div className="au-card-content">
            {err && <ErrorNote>{err}</ErrorNote>}
            <form onSubmit={onSubmit} className="au-grid" style={{ gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="au-note">Full name</label>
                <input
                  className="au-input"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, fullName: e.target.value }))
                  }
                  autoComplete="name"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="au-note">Email</label>
                <input
                  className="au-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="au-note">Password</label>
                <input
                  className="au-input"
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, password: e.target.value }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="au-note">Confirm password</label>
                <input
                  className="au-input"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, confirm: e.target.value }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <div className="au-row" style={{ gridColumn: "1 / -1", gap: 12 }}>
                <button type="submit" className="au-btn au-btn-primary">
                  Create account
                </button>
                <button
                  type="button"
                  className="au-btn au-btn-secondary"
                  onClick={goLogin}
                >
                  I already have an account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* -------------------- Dashboard -------------------- */
function DashboardPage({ me, route, onLogout }) {
  const apps = useMemo(() => {
  if (me && me.apps && me.apps.length) return me.apps;
  return defaultApps;
}, [me]);
  return (
    <Shell route={route} onLogout={onLogout}>
      <div className="au-grid" style={{ gap: 24 }}>
        <h2 style={{ fontWeight: 600 }}>
  Welcome {me && me.fullName ? me.fullName : ""} 👋
</h2>
        <div className="au-grid au-grid-3">
          {apps.map((app) => (
            <div key={app.id} className="au-card">
              <div className="au-card-header">
                <div className="au-row-between">
                  <div className="au-subtle" style={{ fontWeight: 600 }}>
                    {app.name}
                  </div>
                  {app.badge && <span className="au-badge">{app.badge}</span>}
                </div>
              </div>
              <div className="au-card-content">
                <div className="au-note">{app.desc}</div>
              </div>
              <div className="au-card-footer">
                <button
                  className="au-btn au-btn-primary"
                  onClick={() => alert(`Open ${app.name}`)}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------- Main App -------------------- */
function App() {
  const [route, setRoute] = useState("loading");
  const [err, setErr] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [me, setMe] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data && data.user) {
        setMe({ fullName: data.user.user_metadata.fullName, email: data.user.email });
        setRoute("dashboard");
      } else {
        setRoute("login");
      }
    });
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    const { email, password } = loginForm;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);
    setMe({ fullName: data.user.user_metadata.fullName, email: data.user.email });
    setRoute("dashboard");
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErr("");
    if (signupForm.password !== signupForm.confirm) {
      return setErr("Passwords do not match.");
    }
    const { data, error } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: { data: { fullName: signupForm.fullName } },
    });
    if (error) return setErr(error.message);
    setMe({ fullName: signupForm.fullName, email: signupForm.email });
    setRoute("dashboard");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMe(null);
    setRoute("login");
  }

  if (route === "loading") return <div className="au-container">Loading…</div>;
  if (route === "login")
    return (
      <LoginPage
        err={err}
        form={loginForm}
        setForm={setLoginForm}
        onSubmit={handleLogin}
        goSignup={() => {
          setErr("");
          setRoute("signup");
        }}
        route={route}
        onLogout={handleLogout}
      />
    );
  if (route === "signup")
    return (
      <SignupPage
        err={err}
        form={signupForm}
        setForm={setSignupForm}
        onSubmit={handleSignup}
        goLogin={() => {
          setErr("");
          setRoute("login");
        }}
        route={route}
        onLogout={handleLogout}
      />
    );
  return <DashboardPage me={me} route={route} onLogout={handleLogout} />;
}

/* -------------------- Mount -------------------- */
ReactDOM.createRoot(document.getElementById("auth-root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
