/* SNCU Tickler service worker: offline app shell, never caches the cloud API */
const V='sncu-v4',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'],
LIBS=['https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(V);await c.addAll(SHELL);await Promise.all(LIBS.map(u=>c.add(u).catch(()=>{})));self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;                                   // POSTs (login/sync) go straight to the network
  if(u.hostname.endsWith('google.com')||u.hostname.endsWith('googleusercontent.com'))return; // Apps Script API: never cached
  if(u.origin===location.origin){                               // own files: network first, cache fallback (so updates arrive)
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(k=>k.put(r,c));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
  if(u.hostname==='cdnjs.cloudflare.com'){                      // libraries: cache first
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{const c=x.clone();caches.open(V).then(k=>k.put(r,c));return x})))}
});
