import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <head>
      <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval'" />
    </head>
    <App />
  </React.StrictMode>,
);
