const CACHE = 'buhuo-v7';
const CORE = [
  '/',
  '/buhuo.html',
  '/chumen.html',
  '/huan.html',
  '/today.html',
  '/fang.html',
  '/sibu.html',
  '/shuaya.html',
  '/guli.html',
  '/sw.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 逐个存，某一个失败不影响其他的
      return Promise.all(CORE.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// 网络优先：有网拿最新，没网用缓存。
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function (resp) {
      const copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        return new Response('这个页面还没存到手机里，联网打开一次就可以了。', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
