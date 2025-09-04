import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./auth-app.jsx";

const root = document.getElementById("auth-root");
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
