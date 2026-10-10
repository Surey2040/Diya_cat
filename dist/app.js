const $=s=>document.getElementById(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=[],visible=[],activeIndex=0,loading=false;
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
function render(){const q=$('searchInput').value.trim().toLowerCase();visible=products.filter(p=>[p.name,p.code,p.fabric,p.category].join(' ').toLowerCase().includes(q));$('productGrid').innerHTML=visible.map(p=>`<button class="product-card" data-id="${esc(p.id)}" aria-label="View ${esc(p.name)}"><div class="product-visual"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}"><span class="product-number">${esc(p.code)}</span><span class="tap-mark">↗</span></div><div class="product-info"><p class="product-category">${esc(p.category)}</p><h3>${esc(p.name)}</h3><div class="product-meta"><span>${esc(p.fabric)}</span><strong>${money(p.price)}</strong></div></div></button>`).join('');$('emptyState').style.display=visible.length?'none':'block';$('resultCount').textContent=visible.length+' styles';$('heroCount').textContent=products.length;$('emptyState').textContent=products.length?'No styles match that search.':'Our next collection is coming soon.';}
function openProduct(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;activeIndex=products.indexOf(p);$('detailImage').src=p.image;$('detailImage').alt=p.name;['neckZoom','fabricZoom','hemZoom'].forEach(k=>$(k).style.backgroundImage='url('+JSON.stringify(p.image)+')');for(const [key,v]of Object.entries({detailCollection:p.category,detailName:p.name,detailCode:p.code,detailDescription:p.description,detailPrice:money(p.price),detailFabric:p.fabric,detailSizes:p.sizes||'Contact us for size details'}))$(key).textContent=v;if(!$('productDialog').open)$('productDialog').showModal();document.body.style.overflow='hidden';}
function closeDialog(){$('productDialog').close();document.body.style.overflow='';}
function showStall(s){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());const el=$('nextStall');el.hidden=!(s?.published&&(s.endDate||s.startDate)>=today);if(el.hidden)return;const date=v=>new Date(v+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});el.innerHTML=`<small style="letter-spacing:3px">OUR NEXT STALL</small><h2>${esc(s.eventName)}</h2><p>${esc(s.venue)} · ${esc(s.address)}</p><p>${date(s.startDate)}${s.endDate?' – '+date(s.endDate):''} · ${esc(s.startTime)} – ${esc(s.endTime)}</p>${/^https?:\/\//.test(s.mapUrl)?`<a href="${esc(s.mapUrl)}" target="_blank" rel="noopener" style="color:inherit">Get directions ↗</a>`:''}`;}
let cloudSucceeded=false;
async function refresh(){
 if(loading||!window.DiyaCloud?.configured)return;
 loading=true;
 try{
  const data=await window.DiyaCloud.load();
  if(!Array.isArray(data.products))throw Error('Invalid catalogue response');
  products=data.products;cloudSucceeded=true;render();showStall(data.stall);
  $('loadMessage').textContent='';
 }catch(e){
  // Keep the last successful collection; never resurrect deleted items after a successful sync.
  console.warn('Catalogue sync unavailable:',e.message);
  $('loadMessage').textContent=cloudSucceeded?'Updates are temporarily unavailable. Showing the last loaded collection.':'Showing our preview collection. Latest updates are temporarily unavailable.';
 }finally{loading=false;}
}
$('productGrid').onclick=e=>{const b=e.target.closest('[data-id]');if(b)openProduct(b.dataset.id)};
$('searchInput').oninput=render;$('searchToggle').onclick=()=>{$('searchPanel').classList.toggle('open');$('searchInput').focus()};$('dialogClose').onclick=closeDialog;$('productDialog').addEventListener('close',()=>document.body.style.overflow='');$('prevProduct').onclick=()=>{if(products.length)openProduct(products[(activeIndex-1+products.length)%products.length].id)};$('nextProduct').onclick=()=>{if(products.length)openProduct(products[(activeIndex+1)%products.length].id)};
products=window.DIYA_INITIAL_PRODUCTS||[];render();
window.addEventListener('DOMContentLoaded',refresh);
window.addEventListener('focus',()=>{if(!$('productDialog').open)refresh()});setInterval(()=>{if(!document.hidden&&!$('productDialog').open)refresh()},30000);refresh();
