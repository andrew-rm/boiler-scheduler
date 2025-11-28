// 배포할 때마다 버전 숫자 꼭 올리기!
const CACHE_NAME = "boiler-scheduler-v3";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  // "./icon-192.png",
  // "./icon-512.png"
];

// 새 서비스워커 설치되면 바로 활성화
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// 기존 탭도 즉시 새로운 서비스워커 사용
self.addEventListener("activate", event => {
  clients.claim();
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

// 최신 파일 우선 가져오되, 실패하면 캐시 사용
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 받은 최신 데이터를 캐시에 저장
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // 오프라인이면 캐시 fallback
  );
});
