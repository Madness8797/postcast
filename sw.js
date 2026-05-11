const CACHE = "ilpost-v5";
const ASSETS = [
  "/postcast/",
  "/postcast/index.html",
  "/postcast/manifest.json",
  "/postcast/icon-180.png",
  "/postcast/icon-192.png",
  "/postcast/icon-512.png"
];

// ── Install: precache della shell ────────────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: elimina cache vecchie ─────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // API Il Post e proxy codetabs: sempre network, mai cache
  // (i contenuti podcast devono essere sempre aggiornati)
  if (url.includes("ilpost.it") || url.includes("codetabs")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Copertine podcast (wikimedia, cdn, etc.): network-first con fallback cache
  if (url.includes("wikimedia.org") || url.includes("cdn.") || url.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          if (resp.ok && e.request.method === "GET") {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Tutto il resto (shell, manifest, icone, hls.js): cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
