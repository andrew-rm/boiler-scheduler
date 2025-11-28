// 캐시 버전 올리기
const CACHE_NAME = "boiler-scheduler-v2";

const URLS_TO_CACHE = [
  "./",
  "./manifest.webmanifest",
  // 필요하면 아이콘 등 파일도 추가
  "./icon-192.png",
  "./icon-512.png"
];

// 설치: 정적 파일 캐싱
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 활성화: 이전 버전 캐시 삭제
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

// 요청 가로채기
self.addEventListener("fetch", event => {
  // 1) 페이지 이동(HTML)은 네트워크 우선
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 응답 성공하면 캐시에 백업해 두기
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 오프라인일 때만 캐시된 index.html 사용
          return caches.match("./index.html");
        })
    );
    return;
  }

  // 2) 그 외 (css, js, 이미지 등)는 캐시 우선
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
