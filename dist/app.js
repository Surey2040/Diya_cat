const $=s=>document.getElementById(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=[],visible=[],activeIndex=0,loading=false;
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
function render(){const q=$('searchInput').value.trim().toLowerCase();visible=products.filter(p=>[p.name,p.code,p.fabric,p.category].join(' ').toLowerCase().includes(q));$('productGrid').innerHTML=visible.map(p=>`<button class="product-card" data-id="${esc(p.id)}" aria-label="View ${esc(p.name)}"><div class="product-visual"><img src="${esc(p.image)}" alt="${esc(p.name)}"><span class="product-number">${esc(p.code)}</span><span class="tap-mark">↗</span></div><div class="product-info"><p class="product-category">${esc(p.category)}</p><h3>${esc(p.name)}</h3><div class="product-meta"><span>${esc(p.fabric)}</span><strong>${money(p.price)}</strong></div></div></button>`).join('');$('emptyState').style.display=visible.length?'none':'block';$('resultCount').textContent=visible.length+' styles';if($('heroCount'))$('heroCount').textContent=products.length;$('emptyState').textContent=products.length?'No styles match that search.':'Our next collection is coming soon.';}
function openProduct(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;activeIndex=products.indexOf(p);$('detailImage').src=p.image;$('detailImage').alt=p.name;['neckZoom','fabricZoom','hemZoom'].forEach(k=>$(k).style.backgroundImage='url('+JSON.stringify(p.image)+')');for(const [key,v]of Object.entries({detailCollection:p.category,detailName:p.name,detailCode:p.code,detailDescription:p.description,detailPrice:money(p.price),detailFabric:p.fabric,detailSizes:p.sizes||'Contact us for size details'}))$(key).textContent=v;if(!$('productDialog').open)$('productDialog').showModal();document.body.style.overflow='hidden';}
function closeDialog(){$('productDialog').close();document.body.style.overflow='';}
function showStall(s){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());const el=$('nextStall');el.hidden=!(s?.published&&(s.endDate||s.startDate)>=today);if(el.hidden)return;const date=v=>new Date(v+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});el.innerHTML=`<div class="stall-banner"><div class="stall-header"><p class="eyebrow" style="color:rgba(255,255,255,0.7);margin:0 0 6px 0">NEXT STALL LOCATION</p><h2 style="font-family:Georgia,serif;font-size:24px;margin:0;color:white;letter-spacing:-0.5px">${esc(s.eventName)}</h2></div><div class="stall-details"><div class="stall-detail-item"><span class="stall-label">Place</span><span class="stall-value">${esc(s.venue)}, ${esc(s.address)}</span></div><div class="stall-detail-item"><span class="stall-label">Date</span><span class="stall-value">${date(s.startDate)}${s.endDate?' – '+date(s.endDate):''}</span></div><div class="stall-detail-item"><span class="stall-label">Time</span><span class="stall-value">${esc(s.startTime)} – ${esc(s.endTime)}</span></div></div>${/^https?:\/\//.test(s.mapUrl)?`<a class="stall-map-link" href="${esc(s.mapUrl)}" target="_blank" rel="noopener">Get directions <span>↗</span></a>`:''}</div>`;}
let cloudSucceeded=false;
async function refresh(){
 if(loading||!window.DiyaCloud?.configured)return;
 loading=true;
 try{
  const data=await window.DiyaCloud.load();
  if(!Array.isArray(data.products))throw Error('Invalid catalogue response');
  products=data.products;cloudSucceeded=true;render();if(!$('heroCoverflow').innerHTML)initCoverflow();showStall(data.stall);
  $('loadMessage').textContent='';
 }catch(e){
  // Keep the last successful collection; never resurrect deleted items after a successful sync.
  console.warn('Catalogue sync unavailable:',e.message);
  $('loadMessage').textContent=cloudSucceeded?'Updates are temporarily unavailable. Showing the last loaded collection.':'Showing our preview collection. Latest updates are temporarily unavailable.';
 }finally{loading=false;}
}
$('productGrid').onclick=e=>{const b=e.target.closest('[data-id]');if(b)openProduct(b.dataset.id)};
$('searchInput').oninput=render;$('searchToggle').onclick=()=>{$('searchPanel').classList.toggle('open');$('searchInput').focus()};$('dialogClose').onclick=closeDialog;$('productDialog').addEventListener('close',()=>document.body.style.overflow='');$('prevProduct').onclick=()=>{if(products.length)openProduct(products[(activeIndex-1+products.length)%products.length].id)};$('nextProduct').onclick=()=>{if(products.length)openProduct(products[(activeIndex+1)%products.length].id)};

let cfPos=0,cfTimer;
function initCoverflow(){const c=$('heroCoverflow');if(!c||!products.length)return;c.innerHTML=products.map(p=>`<article class="cf-card"><img src="${esc(p.image)}" alt="${esc(p.name)}"></article>`).join('');updateCoverflow();clearInterval(cfTimer);cfTimer=setInterval(()=>{if(!document.hidden&&!$('productDialog').open){cfPos=(cfPos-1+products.length)%products.length;updateCoverflow()}},3000)}
function updateCoverflow(){const cards=document.querySelectorAll('.cf-card'),count=cards.length;if(!count)return;cards.forEach((card,i)=>{let offset=i-cfPos;if(offset>count/2)offset-=count;else if(offset<-count/2)offset+=count;const d=Math.abs(offset);if(d>2){card.style.opacity=0;card.style.transform=`translateX(${Math.sign(offset)*600}px) translateZ(-500px)`;card.style.pointerEvents='none';card.style.zIndex=0}else{const sign=Math.sign(offset),ramp=Math.pow(d,0.56),tilt=Math.min(44*ramp,82)*sign;card.style.opacity=d>1?0:1;card.style.transform=`translateX(${offset*220}px) translateZ(${-160*ramp}px) rotateY(${-tilt}deg)`;card.style.zIndex=100-Math.round(d);card.style.pointerEvents=d===0?'auto':'none'}});const p=products[cfPos];if(p){const cap=document.querySelector('.coverflow-caption');if(cap){cap.style.opacity=0;setTimeout(()=>{if($('cfName')){navigator.maxTouchPoints?null:null;$('cfName').textContent=p.name;$('cfMeta').textContent=p.fabric+' • '+p.category;$('cfPrice').textContent=money(p.price);cap.style.opacity=1}},300)}}}

products=window.DIYA_INITIAL_PRODUCTS||[];render();initCoverflow();
window.addEventListener('DOMContentLoaded',refresh);
window.addEventListener('focus',()=>{if(!$('productDialog').open)refresh()});setInterval(()=>{if(!document.hidden&&!$('productDialog').open)refresh()},30000);refresh();
