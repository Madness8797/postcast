const CACHE = "ilpost-v5.4";

const ASSETS = [
  "/postcast/",
  "/postcast/index.html",
  "/postcast/manifest.json",
  "/postcast/icon-180.png",
  "/postcast/icon-192.png",
  "/postcast/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;

  if (url.includes("ilpost.it") || url.includes("codetabs")) {
    e.respondWith(fetch(e.request));
    return;
  }

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

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
