import React from 'react';
import ReactDOM from 'react-dom/client';
import './storage-shim.js';   // must run before App reads window.storage
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* Register the service worker so the app works with no connection.
   Only in production: during `npm run dev` a cached bundle would hide
   your edits, which is the classic service-worker frustration. */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const reg = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base });

      // When a new version is ready, tell the user rather than silently
      // leaving them on the old one.
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    } catch (err) {
      // Offline support is a bonus, never a requirement. Failing to
      // register must not affect the app.
      console.warn('Offline support unavailable:', err);
    }
  });
}

function showUpdateBanner() {
  if (document.getElementById('sw-update')) return;
  const bar = document.createElement('div');
  bar.id = 'sw-update';
  bar.setAttribute('role', 'status');
  bar.innerHTML =
    '<span>A new version is ready.</span>' +
    '<button type="button">Reload</button>';
  bar.querySelector('button').addEventListener('click', () => location.reload());
  document.body.appendChild(bar);
}
