/* SNCU Tickler service worker — app-shell cache with a user-controlled update flow; never caches the cloud API.
   The cached app opens instantly and fully offline. A newer index.html is NOT swapped in silently:
   the page (see the "Update flow" script in index.html) checks for a new version, downloads it into
   a staging cache with a progress ring, asks the user to tap Update, then copies it into this cache
   and restarts. Requests carrying ?__chk=… always go straight to the network (used by those checks). */
const CACHE = 'sncu-v12';                 // active app shell
const STAGE = 'sncu-stage';              // a downloaded-but-not-yet-installed update (managed by the page)
const VER   = './__ver.json';            // {etag, lm, size, t} of the index.html held in CACHE
const SHELL = ['./index.html', './manifest.webmanifest',
               './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];
const LIBS  = [
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

const metaOf = (res, size) => ({
  etag: res.headers.get('etag') || '',
  lm: res.headers.get('last-modified') || '',
  size: size || 0,
  t: Date.now()
});

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of SHELL) {
      const res = await fetch(new Request(u, { cache: 'reload' }));
      if (!res.ok) throw new Error(u + ' ' + res.status);
      if (u === './index.html') {
        const b = await res.blob();
        await c.put(u, new Response(b, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
        await c.put(VER, new Response(JSON.stringify(metaOf(res, b.size)),
                                      { headers: { 'Content-Type': 'application/json' } }));
      } else {
        await c.put(u, res);
      }
    }
    await Promise.all(LIBS.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== STAGE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'PING' && e.ports && e.ports[0]) e.ports[0].postMessage({ v: 2 });   // tells the page this worker supports the update flow
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                       // POSTs (login/sync) go straight to the network
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com')) return;   // Apps Script API: never cached

  if (url.origin === location.origin) {
    if (url.searchParams.has('__chk')) return;            // update check / download → always network
    const key = req.mode === 'navigate' ? new Request('./index.html') : req;
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(key, { ignoreSearch: true });
      if (hit) return hit;                                // cache-first: no silent background swap
      try {
        const res = await fetch(req);
        if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
        return res;
      } catch (_) {
        return (await cache.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  if (url.hostname === 'cdnjs.cloudflare.com') {          // libraries: cache first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })));
  }
});
