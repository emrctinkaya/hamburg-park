const CACHE='hamburg-park-v1.6.0';
const SHELL=['./','./index.html','./manifest.json','./icon.svg','./localization-fix.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.hostname==='api.hamburg.de'||url.hostname.includes('tile.openstreetmap.org')||url.hostname==='unpkg.com'){
    event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
    return;
  }
  const isDocument=event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/hamburg-park/');
  if(isDocument){
    event.respondWith(fetch(event.request).then(async response=>{
      const html=await response.clone().text();
      const patched=html.includes('localization-fix.js')?html:html.replace('</body>','<script src="./localization-fix.js"></script></body>');
      const out=new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
      caches.open(CACHE).then(cache=>cache.put(event.request,out.clone())).catch(()=>{});
      return out;
    }).catch(()=>caches.match(event.request).then(async r=>{
      if(!r)return caches.match('./');
      const html=await r.text();
      return new Response(html.includes('localization-fix.js')?html:html.replace('</body>','<script src="./localization-fix.js"></script></body>'),{headers:{'Content-Type':'text/html; charset=utf-8'}});
    })));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});return response;}).catch(()=>caches.match(event.request)));
});