const CACHE = 'smart-order-v4-install-lowcost';

const SHELL = [
  './index.html',
  './data.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Only own Smart Order assets belong in the app cache.
  if (url.origin !== self.location.origin) return;

  // version.json always goes to the network and is never cached.
  // The app only requests this about once a week; it must never be served stale.
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {
      headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }

  // Navigations always use the cached app shell after the first successful visit.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(hit => hit || fetch(e.request))
    );
    return;
  }

  // data.json: serve cache first, but let a `reload` request refresh it.
  if (url.pathname.endsWith('data.json') && e.request.cache === 'reload') {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./data.json', copy));
        return res;
      }).catch(() => caches.match('./data.json'))
    );
    return;
  }

  // Everything else: cache first, fall back to network, cache what comes back.
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
