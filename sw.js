const STATIC_CACHE = "dzikir-static";

const ASSETS = [
  "/",
  "/search.css",
  "/search.js",

  "/icon-192.png",
  "/icon-512.png",

  "/audio/adzan.mp3",

  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
];

// Install
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

// Fetch
self.addEventListener("fetch", event => {

  const req = event.request;

  // HTML selalu terbaru dari server
  if (
      req.mode === "navigate" ||
      req.destination === "document"
  ) {

      event.respondWith(
          fetch(req)
            .then(res => res)
            .catch(() => caches.match("/index.html"))
      );

      return;
  }

  // CSS, JS, Font, Audio, Gambar = cache first
  event.respondWith(
      caches.match(req)
        .then(cacheRes => {

            if (cacheRes) {
                return cacheRes;
            }

            return fetch(req).then(networkRes => {

                const clone = networkRes.clone();

                caches.open(STATIC_CACHE)
                  .then(cache => {
                      cache.put(req, clone);
                  });

                return networkRes;
            });

        })
  );

});