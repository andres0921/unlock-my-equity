import React from "react";
import ReactDOM from "react-dom/client";
import { findRoute } from "./routes.js";
import "./index.css";

const { Component } = findRoute(window.location.pathname);
const root = document.getElementById("root");
const app = (
  <React.StrictMode>
    <Component />
  </React.StrictMode>
);

// Pages are pre-rendered at build time (prerender.js); in `vite dev` the root
// is empty, so render from scratch there.
if (root.firstElementChild) {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
