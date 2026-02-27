import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Unregister old service workers to prevent black screen issues
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
