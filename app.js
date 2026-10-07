'use strict';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const TYPES=['زمین','خانه','آپارتمان','دکان','دفتر','باغ','پروژه','سایر'],DEALS=['فروشی','گروی','کرایی'],
STAT=['موجود','فروخته شد','گرو داده شد','کرایه رفت','غیر فعال'],AREA=['متر مربع','جریب','بسوه','جریب (هکتار)'],CUR=['افغانی','دالر'];
const DEF={name:'رهنمای معاملات صداقت محمدی',addr:'کمربند بابه یادگار، نرسیده به دانشگاه راه سعادت',wa:'0789294007',tel:'0708899107'};
/* ---------- IndexedDB ---------- */
let db;
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('sadaqat',1);
r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('props',{keyPath:'id'});d.createObjectStore('settings',{keyPath:'k'})};
r.onsuccess=()=>{db=r.result;res()};r.onerror=()=>rej(r.error)});
const tx=(s,m='readonly')=>db.transaction(s,m).objectStore(s);
const rq=r=>new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)});
const all=()=>rq(tx('props').getAll()),put=p=>rq(tx('props','readwrite').put(p)),delp=id=>rq(tx('props','readwrite').delete(id));
const getS=async k=>(await rq(tx('settings').get(k)))?.v,putS=(k,v)=>rq(tx('settings','readwrite').put({k,v}));
/* ---------- helpers ---------- */
let S={...DEF},list=[],view='grid',F={q:'',deal:'',type:'',project:'',area:'',min:'',max:'',sort:'new',show:'active'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]),num=n=>fa(Number(n).toLocaleString('en'));
const date=t=>fa(new Date(t).toLocaleDateString('fa-AF-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}));
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200)};
const url=b=>b?URL.createObjectURL(b):'';
const intl=n=>{n=String(n).replace(/[^\d]/g,'');return n.startsWith('0')?'93'+n.slice(1):n};
const price=p=>p.price?`${num(p.price)} ${esc(p.cur||'')}`:'—';
const area=p=>p.area?`${fa(p.area)} ${esc(p.unit||'')}`:'—';
const thumb=p=>p.photos?.[0]?`<img loading="lazy" src="${url(p.photos[0])}" alt="">`:'<div class="ph">🏠</div>';
const b2d=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r({d:f.result,t:b.type,n:b.name||''});f.readAsDataURL(b)});
const d2b=async o=>{const r=await fetch(o.d);return new Blob([await r.blob()],{type:o.t})};
async function refresh(){list=await all();const l=await getS('logo');S={...DEF,...(await getS('office')||{})};
const src=l?url(l):null;$('#logoH').src=src||'assets/emblem.png';$('#logoS').src=src||'assets/logo.png';window.LOGO=src||'assets/logo.png';
$('#hName').textContent=S.name;$('#hTel').textContent=fa(S.tel);$('#hWa').href='https://wa.me/'+intl(S.wa)}
/* ---------- router ---------- */
const P={};let cur='home';
async function go(p,arg){cur=p;$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===p||(p==='detail'&&b.dataset.p==='list')));
$('#view').innerHTML='<div class="empty">در حال بارگذاری…</div>';try{await refresh();await P[p](arg)}catch(e){console.error(e);$('#view').innerHTML=`<div class="empty">⚠️ خطا: ${esc(e.message)}</div>`}scrollTo(0,0)}
$$('nav button').forEach(b=>b.onclick=()=>go(b.dataset.p));
/* ---------- cards ---------- */
const card=p=>`<div class="p" data-id="${p.id}">${thumb(p)}<div><span class="tag">${esc(p.deal)}</span> ${p.status!=='موجود'?`<span class="tag g">${esc(p.status)}</span>`:''}<b>${esc(p.title)}</b>
<span class="price">${price(p)}</span><br>📍 ${esc(p.zone||p.address||'—')}<br>📐 ${area(p)}<br>📞 ${fa(p.phone||S.wa)}<br><small>${date(p.created)} · #${fa(p.no)}</small></div></div>`;
const bind=()=>$$('.p').forEach(c=>c.onclick=()=>go('detail',c.dataset.id));
const cards=a=>a.length?a.map(card).join(''):'';
/* ---------- home ---------- */
P.home=()=>{const a=list.filter(p=>!p.deleted),n=d=>a.filter(p=>p.deal===d).length;
$('#view').innerHTML=`<div class="card" style="text-align:center"><img class="logo hero" src="${window.LOGO}" alt=""><h3 style="margin:8px 0 2px">${esc(S.name)}</h3><small>${esc(S.addr)}</small>
<div class="row" style="margin-top:12px"><a class="btn out" href="tel:${esc(S.tel)}">📞 ${fa(S.tel)}</a><a class="btn wa" target="_blank" href="https://wa.me/${intl(S.wa)}">واتساپ</a></div></div>
<div class="stats"><div class="card stat"><b>${fa(a.length)}</b><span>کل جایدادها</span></div><div class="card stat"><b>${fa(n('فروشی'))}</b><span>فروشی</span></div><div class="card stat"><b>${fa(n('گروی'))}</b><span>گروی</span></div><div class="card stat"><b>${fa(n('کرایی'))}</b><span>کرایی</span></div></div>
<button class="btn gold" id="nw" style="margin:6px 0">+ ثبت جایداد جدید</button><h3>آخرین جایدادهای ثبت‌شده</h3>
<div class="grid">${cards(a.sort((x,y)=>y.created-x.created).slice(0,6))}</div>${a.length?'':'<div class="empty">هنوز جایدادی ثبت نشده است.</div>'}`;
$('#nw').onclick=()=>go('form');bind()};
/* ---------- list ---------- */
P.list=()=>{const projects=[...new Set(list.map(p=>p.project).filter(Boolean))],zones=[...new Set(list.map(p=>p.zone).filter(Boolean))];
const opt=(a,v)=>'<option value="">همه</option>'+a.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
$('#view').innerHTML=`<input id="q" type="search" placeholder="جستجو: نام، منطقه، نمره، بلاک، پروژه، شماره…" value="${esc(F.q)}">
<div class="chips" id="dc"><button data-d="">همه</button>${DEALS.map(d=>`<button data-d="${d}">${d}</button>`).join('')}<button id="ft">🔎 فیلتر</button><button id="vw">${view==='grid'?'☰ لیست':'▦ شبکه'}</button></div>
<div class="card" id="fp" hidden><label>نوع جایداد</label><select id="ft1">${opt(TYPES,F.type)}</select><label>پروژه</label><select id="ft2">${opt(projects,F.project)}</select><label>منطقه</label><select id="ft3">${opt(zones,F.area)}</select>
<div class="row"><div><label>قیمت از</label><input id="mn" type="number" value="${F.min}"></div><div><label>تا</label><input id="mx" type="number" value="${F.max}"></div></div>
<label>مرتب‌سازی</label><select id="so"><option value="new">جدیدترین</option><option value="pa">قیمت: کم به زیاد</option><option value="pd">قیمت: زیاد به کم</option><option value="aa">مساحت: کم به زیاد</option><option value="ad">مساحت: زیاد به کم</option></select>
<label>نمایش</label><select id="sh"><option value="active">جایدادهای فعال</option><option value="all">همه (با غیرفعال)</option><option value="trash">سطل زباله</option></select><button class="btn out" id="rs">پاک کردن فیلترها</button></div><div id="res"></div>`;
$('#fp').hidden=true;$('#so').value=F.sort;$('#sh').value=F.show;
const run=()=>{F.q=$('#q').value.trim();F.type=$('#ft1').value;F.project=$('#ft2').value;F.area=$('#ft3').value;F.min=$('#mn').value;F.max=$('#mx').value;F.sort=$('#so').value;F.show=$('#sh').value;
$$('#dc [data-d]').forEach(b=>b.classList.toggle('on',b.dataset.d===F.deal));
let a=list.filter(p=>F.show==='trash'?p.deleted:!p.deleted&&(F.show==='all'||p.status!=='غیر فعال'));
const q=F.q.toLowerCase();
if(q)a=a.filter(p=>[p.title,p.zone,p.address,p.plot,p.block,p.project,p.phone,p.owner,p.no].some(v=>String(v??'').toLowerCase().includes(q)));
if(F.deal)a=a.filter(p=>p.deal===F.deal);if(F.type)a=a.filter(p=>p.type===F.type);if(F.project)a=a.filter(p=>p.project===F.project);if(F.area)a=a.filter(p=>p.zone===F.area);
if(F.min)a=a.filter(p=>+p.price>=+F.min);if(F.max)a=a.filter(p=>+p.price<=+F.max);
const s={new:(x,y)=>y.created-x.created,pa:(x,y)=>x.price-y.price,pd:(x,y)=>y.price-x.price,aa:(x,y)=>x.area-y.area,ad:(x,y)=>y.area-x.area}[F.sort];a.sort(s);
$('#res').innerHTML=a.length?`<div class="grid ${view==='list'?'list':''}">${cards(a)}</div>`:'<div class="empty">🔍 جایدادی پیدا نشد.</div>';
if(F.show==='trash')$$('.p').forEach(c=>c.onclick=async()=>{if(confirm('این جایداد بازیابی شود؟')){const p=list.find(x=>x.id===c.dataset.id);p.deleted=0;await put(p);toast('بازیابی شد');go('list')}});else bind()};
$('#q').oninput=run;$$('#fp select,#fp input').forEach(e=>e.onchange=run);
$$('#dc [data-d]').forEach(b=>b.onclick=()=>{F.deal=b.dataset.d;run()});$('#ft').onclick=()=>$('#fp').hidden=!$('#fp').hidden;
$('#vw').onclick=()=>{view=view==='grid'?'list':'grid';P.list()};$('#rs').onclick=()=>{F={q:'',deal:'',type:'',project:'',area:'',min:'',max:'',sort:'new',show:'active'};P.list()};run()};
/* ---------- form ---------- */
P.form=id=>{const e=id?list.find(p=>p.id===id):null,p=e||{deal:'فروشی',type:'زمین',unit:AREA[0],cur:CUR[0],status:'موجود',photos:[],videos:[]};
let photos=[...p.photos||[]],videos=[...p.videos||[]];
const sel=(n,a,v)=>`<select id="${n}">${a.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`,v=k=>esc(p[k]??'');
$('#view').innerHTML=`<h3>${e?'ویرایش جایداد':'ثبت جایداد جدید'}</h3><div class="card"><label>نوع معامله</label><div class="chips" id="dl">${DEALS.map(d=>`<button type="button" data-d="${d}" class="${d===p.deal?'on':''}">${d}</button>`).join('')}</div>
<label>عنوان جایداد *</label><input id="title" value="${v('title')}"><label>نوع جایداد</label>${sel('type',TYPES,p.type)}<label>وضعیت</label>${sel('status',STAT,p.status)}
<label>آدرس</label><input id="address" value="${v('address')}"><label>ساحه / منطقه</label><input id="zone" value="${v('zone')}">
<div class="row"><div><label>مساحت</label><input id="area" type="number" inputmode="decimal" value="${v('area')}"></div><div><label>واحد</label>${sel('unit',AREA,p.unit)}</div></div>
<div class="row"><div><label>قیمت</label><input id="price" type="number" inputmode="numeric" value="${v('price')}"></div><div><label>واحد پول</label>${sel('cur',CUR,p.cur)}</div></div>
<label>نام مالک</label><input id="owner" value="${v('owner')}"><label>شماره تماس مالک</label><input id="phone" type="tel" value="${v('phone')}">
<label>توضیحات</label><textarea id="desc" rows="3">${v('desc')}</textarea></div>
<div class="card"><label><input type="checkbox" id="isp" style="width:auto;margin-inline-end:8px" ${p.isProject?'checked':''}> جایداد پروژه‌ای / نمره</label><div id="pj" hidden><label>نام پروژه</label><input id="project" value="${v('project')}"><div class="row"><div><label>شماره نمره</label><input id="plot" value="${v('plot')}"></div><div><label>بلاک</label><input id="block" value="${v('block')}"></div></div>
<div class="row"><div><label>قسمت / بخش</label><input id="part" value="${v('part')}"></div><div><label>فاز</label><input id="phase" value="${v('phase')}"></div></div><label>مساحت نمره</label><input id="parea" value="${v('parea')}"><label>موقعیت پروژه</label><input id="ploc" value="${v('ploc')}"><label>توضیحات پروژه</label><textarea id="pdesc" rows="2">${v('pdesc')}</textarea></div></div>
<div class="card"><label>عکس‌ها</label><input id="ph" type="file" accept="image/*" multiple><div class="media" id="pm"></div><label>ویدیو</label><input id="vd" type="file" accept="video/*" multiple><div class="media" id="vm"></div></div>
<button class="btn gold" id="sv">${e?'ذخیره تغییرات':'ثبت جایداد'}</button>`;
$$('#dl button').forEach(b=>b.onclick=()=>{p.deal=b.dataset.d;$$('#dl button').forEach(x=>x.classList.toggle('on',x===b))});
const tg=()=>$('#pj').hidden=!$('#isp').checked;$('#isp').onchange=tg;tg();
const draw=()=>{[['pm',photos,'img'],['vm',videos,'video']].forEach(([i,a,t])=>{$('#'+i).innerHTML='';a.forEach((b,k)=>{const d=document.createElement('div');d.innerHTML=`<${t} src="${url(b)}" ${t==='video'?'muted':''}></${t}><i>✕</i>`;d.lastChild.onclick=()=>{a.splice(k,1);draw()};$('#'+i).append(d)})})};draw();
$('#ph').onchange=ev=>{photos.push(...ev.target.files);ev.target.value='';draw()};$('#vd').onchange=ev=>{videos.push(...ev.target.files);ev.target.value='';draw()};
$('#sv').onclick=async()=>{const t=$('#title').value.trim();if(!t)return toast('عنوان جایداد را وارد کنید');
const g=k=>$('#'+k).value.trim(),now=Date.now(),no=e?e.no:(Math.max(1000,...list.map(x=>x.no||0))+1);
const o={...(e||{}),id:e?e.id:crypto.randomUUID(),no,created:e?e.created:now,updated:now,deleted:e?e.deleted:0,deal:p.deal,title:t,type:g('type'),status:g('status'),address:g('address'),zone:g('zone'),area:g('area'),unit:g('unit'),price:g('price'),cur:g('cur'),owner:g('owner'),phone:g('phone'),desc:g('desc'),
isProject:$('#isp').checked,project:g('project'),plot:g('plot'),block:g('block'),part:g('part'),phase:g('phase'),parea:g('parea'),ploc:g('ploc'),pdesc:g('pdesc'),photos,videos};
try{await put(o);toast('ذخیره شد ✔');go('detail',o.id)}catch(er){toast('خطا در ذخیره: '+er.message)}}};
/* ---------- detail ---------- */
const shareText=p=>`${S.name}\n\n🏠 نوع: ${p.type} (${p.deal})\n📍 موقعیت: ${p.zone||p.address||'—'}\n📐 مساحت: ${p.area?fa(p.area)+' '+p.unit:'—'}\n💰 قیمت: ${p.price?num(p.price)+' '+p.cur:'—'}\n${p.project?`🏗 پروژه: ${p.project} | نمره: ${p.plot||'—'} | بلاک: ${p.block||'—'} | قسمت: ${p.part||'—'}\n`:''}📞 تماس: ${fa(S.wa)} / ${fa(S.tel)}\n🔖 کد: ${fa(p.no)}`;
P.detail=id=>{const p=list.find(x=>x.id===id);if(!p)return go('list');const ph=p.phone||S.wa,r=(a,b)=>b?`<dt>${a}</dt><dd>${esc(b)}</dd>`:'';
$('#view').innerHTML=`<div class="gal">${(p.photos||[]).map(b=>`<img src="${url(b)}" alt="">`).join('')}${(p.videos||[]).map(b=>`<video controls playsinline src="${url(b)}"></video>`).join('')}${p.photos?.length||p.videos?.length?'':'<div class="ph card">🏠</div>'}</div>
<div class="card"><span class="tag">${esc(p.deal)}</span> <span class="tag g">${esc(p.status)}</span><h3 style="margin:8px 0">${esc(p.title)}</h3><div class="price" style="font-size:20px">${price(p)}</div></div>
<div class="card"><dl>${r('کد',fa(p.no))}${r('نوع',p.type)}${r('آدرس',p.address)}${r('منطقه',p.zone)}${r('مساحت',p.area?area(p):'')}${r('مالک',p.owner)}${r('تماس',p.phone?fa(p.phone):'')}${r('تاریخ ثبت',date(p.created))}${r('آخرین ویرایش',date(p.updated||p.created))}</dl></div>
${p.isProject||p.project?`<div class="card"><b>اطلاعات پروژه</b><dl style="margin-top:8px">${r('پروژه',p.project)}${r('نمره',p.plot)}${r('بلاک',p.block)}${r('قسمت',p.part)}${r('فاز',p.phase)}${r('مساحت نمره',p.parea)}${r('موقعیت',p.ploc)}${r('توضیحات',p.pdesc)}</dl></div>`:''}
${p.desc?`<div class="card">${esc(p.desc).replace(/\n/g,'<br>')}</div>`:''}
<div class="row" style="margin-bottom:8px"><a class="btn out" href="tel:${esc(ph)}">📞 تماس</a><a class="btn wa" target="_blank" href="https://wa.me/${intl(ph)}?text=${encodeURIComponent('سلام، درباره: '+p.title)}">واتساپ</a></div>
<div class="row" style="margin-bottom:8px"><button class="btn out" id="cp">کپی شماره</button><button class="btn gold" id="sh">اشتراک‌گذاری</button></div>
<div class="row"><button class="btn" id="ed">ویرایش</button><button class="btn red" id="dl">حذف</button></div>`;
$('#cp').onclick=()=>navigator.clipboard?.writeText(ph).then(()=>toast('کپی شد'),()=>toast('کپی ممکن نشد'));
$('#sh').onclick=async()=>{const t=shareText(p);try{if(navigator.share){const f=p.photos?.[0]?[new File([p.photos[0]],'p.jpg',{type:p.photos[0].type})]:[];await navigator.share(f.length&&navigator.canShare?.({files:f})?{text:t,files:f}:{text:t})}else{await navigator.clipboard.writeText(t);toast('متن کپی شد')}}catch(e){}};
$('#ed').onclick=()=>go('form',p.id);
$('#dl').onclick=async()=>{if(!confirm('آیا مطمئن هستید که می‌خواهید این جایداد حذف شود؟\n(به سطل زباله منتقل می‌شود)'))return;p.deleted=Date.now();await put(p);toast('حذف شد؛ از فیلتر «سطل زباله» قابل بازیابی است');go('list')}};
/* ---------- backup ---------- */
P.backup=()=>{$('#view').innerHTML=`<h3>بکاپ و بازیابی</h3><div class="card"><p>تمام جایدادها همراه عکس‌ها و ویدیوها در یک فایل <b>.json</b> ذخیره می‌شود. فایل را در گوشی، Google Drive یا واتساپ خودتان نگه دارید.</p><br><button class="btn gold" id="ex">Export Backup</button></div>
<div class="card"><p>فایل بکاپ را انتخاب کنید. اطلاعات موجود حفظ می‌شود و جایدادهای بکاپ اضافه یا به‌روز می‌شوند.</p><br><input type="file" id="im" accept=".json,application/json"></div><div class="empty" id="bs"></div>`;
$('#ex').onclick=async()=>{try{$('#bs').textContent='در حال ساخت فایل…';const out=[];for(const p of list){const c={...p};c.photos=await Promise.all((p.photos||[]).map(b2d));c.videos=await Promise.all((p.videos||[]).map(b2d));out.push(c)}
const data=JSON.stringify({app:'sadaqat',v:1,date:Date.now(),office:S,props:out}),f=new File([data],`sadaqat-backup-${new Date().toISOString().slice(0,10)}.json`,{type:'application/json'});
if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f]});$('#bs').textContent='✔ آماده شد';return}catch(e){}}
const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;a.click();$('#bs').textContent='✔ فایل بکاپ دانلود شد'}catch(e){$('#bs').textContent='خطا: '+e.message}};
$('#im').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.app!=='sadaqat'||!Array.isArray(d.props))throw Error('فایل بکاپ معتبر نیست');
if(!confirm(`${fa(d.props.length)} جایداد وارد شود؟`))return;$('#bs').textContent='در حال بازیابی…';
for(const c of d.props){c.photos=await Promise.all((c.photos||[]).map(d2b));c.videos=await Promise.all((c.videos||[]).map(d2b));await put(c)}
if(d.office)await putS('office',d.office);toast('بازیابی کامل شد ✔');go('list')}catch(e){$('#bs').textContent='خطا: '+e.message}}};
/* ---------- settings ---------- */
P.settings=()=>{$('#view').innerHTML=`<h3>اطلاعات تماس دفتر</h3><div class="card"><label>نام دفتر</label><input id="n" value="${esc(S.name)}"><label>شماره واتساپ</label><input id="w" type="tel" value="${esc(S.wa)}"><label>شماره تماس</label><input id="t" type="tel" value="${esc(S.tel)}"><label>آدرس</label><input id="a" value="${esc(S.addr)}"><button class="btn gold" id="s">ذخیره</button></div>
<div class="card"><label>لوگوی دفتر (بدون تغییر نمایش داده می‌شود)</label><input type="file" id="lg" accept="image/*"></div>
<div class="card"><button class="btn red" id="em">خالی کردن سطل زباله (حذف دائمی)</button></div>`;
$('#s').onclick=async()=>{await putS('office',{name:$('#n').value,wa:$('#w').value,tel:$('#t').value,addr:$('#a').value});toast('ذخیره شد ✔');go('settings')};
$('#lg').onchange=async e=>{if(e.target.files[0]){await putS('logo',e.target.files[0]);toast('لوگو ذخیره شد');go('settings')}};
$('#em').onclick=async()=>{const t=list.filter(p=>p.deleted);if(t.length&&confirm(`${fa(t.length)} جایداد برای همیشه حذف شود؟`)){for(const p of t)await delp(p.id);toast('خالی شد');go('settings')}}};
/* ---------- boot ---------- */
(async()=>{try{await open();if(navigator.storage?.persist)navigator.storage.persist();await go('home')}catch(e){$('#view').innerHTML=`<div class="empty">⚠️ ذخیره‌سازی در این مرورگر ممکن نیست: ${esc(e.message)}</div>`}
setTimeout(()=>$('#splash').classList.add('hide'),700);
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{})})();
