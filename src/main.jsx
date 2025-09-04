import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./auth-app.jsx";

/* Simple ErrorBoundary to catch crashes */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Apps-United crash:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#111", color: "red", padding: "20px" }}>
          <h2>⚠️ Crash in Apps-United</h2>
          <pre>{this.state.error.message || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("auth-root");
createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
