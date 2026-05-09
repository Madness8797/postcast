const CACHE = "ilpost-v2";
const ASSETS = [
  "/IlPostPodcast/",
  "/IlPostPodcast/index.html",
  "/IlPostPodcast/manifest.json",
  "/IlPostPodcast/icon-180.png",
  "/IlPostPodcast/icon-192.png",
  "/IlPostPodcast/icon-512.png"
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
  if (e.request.url.includes("ilpost.it") || e.request.url.includes("codetabs")) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});