const CACHE_NAME = "liralink-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./image11.jpg",
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;700;800&family=Inter:wght@400;600;800&display=swap"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});