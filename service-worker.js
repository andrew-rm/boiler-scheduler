const CACHE_NAME = "boiler-scheduler-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
  // 필요하면 아이콘 등 파일도 추가
  // "./icon-192.png",
  // "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 캐시에 있으면 캐시 사용, 없으면 네트워크
      return response || fetch(event.request);
    })
  );
});
