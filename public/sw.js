/**
 * Service worker.
 *
 * Keeps a copy of the app on the device so it opens with no connection —
 * on a subway, a plane, anywhere. It caches the whole bundle, which means
 * all 201 questions, every method guide, and all 294 flashcards come along.
 * Your progress is separate and already lives in localStorage.
 *
 * Strategy: network-first for the page shell so you get updates promptly,
 * cache-first for hashed build assets since their names change on every
 * build and stale ones can never be served by mistake.
 */

const VERSION = 'v1';
const CACHE = `calibrate-${VERSION}`;

// Take over as soon as a new version is installed rather than waiting
// for every tab to close. Paired with the reload prompt in main.jsx.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GETs. Never touch anything else.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: try the network so updates land, fall back to
  // the cached page when offline. This is what makes tunnels work.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          const cached = await cache.match(request);
          return cached || (await cache.match('/index.html')) || Response.error();
        }
      })()
    );
    return;
  }

  // Build assets are content-hashed, so a cache hit is always correct.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
