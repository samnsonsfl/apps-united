import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";            // ✅ Correct CSS import
import App from "./auth-app.jsx";

const root = document.getElementById("auth-root");
createRoot(root).render(<App />);
