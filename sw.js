const CACHE = 'smart-order-v3-receipt';

const SHELL = [
  './',
  './index.html',
  './data.json',
  './manifest.json'
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
  const url = new URL(e.request.url);

  // version.json always goes to the network and is never cached.
  // This is the 30-day sync check — it must never be served stale.
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {
      headers: { 'Content-Type': 'application/json' }
    })));
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
