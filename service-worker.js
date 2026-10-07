const C='sadaqat-v6',F=['./','index.html','style.css','app.js','manifest.json','defaults.js','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.allSettled(F.map(f=>c.add(new Request(f,{cache:'reload'}))))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(C).then(c=>c.put(r,cp))}return n}).catch(()=>r.mode==='navigate'?(caches.match('index.html').then(x=>x||caches.match('./'))):Response.error())))});
