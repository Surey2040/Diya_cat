const collections = [
  {name:'Everyday Cotton', desc:'Breathable cotton-led comfort with soft prints for effortless everyday dressing.', names:['Lilac Bloom','Coral Sprig','Teal Ikat','Indigo Garden','Mustard Leaf','Sage Meadow','Wine Motif','Sky Floral','Coral Vine','Midnight Block'], prices:[899,949,999,1099,899,949,1049,999,899,1199]},
  {name:'Festive Edit', desc:'Rich jewel tones and delicate embroidery designed for intimate celebrations.', names:['Plum Zari','Ruby Noor','Emerald Heirloom','Royal Blue Zari','Ivory Chikankari','Rani Gul','Teal Mehfil','Rust Resham','Navy Gulzar','Lilac Aari'], prices:[1799,1899,2099,2199,1699,1999,1899,1799,2299,1699]},
  {name:'Workwear Minimal', desc:'Refined tailoring, muted colour and subtle surface detail for polished workdays.', names:['Charcoal Pinstripe','Sand Motif','Olive Line','Slate Embroidery','Dusty Mauve','Ivory Stripe','Burgundy Detail','Blue Grey Line','Camel Piping','Muted Lavender'], prices:[1099,999,1099,1299,999,1099,1299,1199,1099,1299]},
  {name:'Anarkali Stories', desc:'Flowing panels, heritage-inspired borders and graceful movement in every silhouette.', names:['Teal Kalamkari','Ivory Blossom','Plum Paisley','Powder Blue Tier','Mustard Festive','Blush Garden','Navy Heritage','Sage Elegance','Crimson Royal','Ivory Indigo'], prices:[2399,2199,2599,2299,2499,2199,2699,2299,2599,2399]},
  {name:'Casual Prints', desc:'Playful colour and expressive prints for light, easy-going wardrobe days.', names:['Pink Meadow','Indigo Block','Sunshine Motif','Tropical Bloom','Sage Buta','Coral Dot','Blue Blossom','Ajrakh Red','Brushstroke Ivory','Pink Check'], prices:[849,899,799,999,899,799,949,999,899,849]}
];
const fabrics=['Premium Cotton','Cotton Slub','Rayon Blend','Soft Cambric','Viscose Cotton','Cotton Flex','Art Silk Blend','Muslin Blend','Rayon Slub','Cotton Blend'];
const products=[];
let id=1;
collections.forEach((collection,ci)=>collection.names.forEach((name,i)=>products.push({
  id:id, code:`DC-${String(id++).padStart(3,'0')}`, name, category:collection.name,
  description:collection.desc, price:collection.prices[i], fabric:fabrics[i], image:`assets/dc-${String(id-1).padStart(3,'0')}.webp`
})));

const grid=document.querySelector('#productGrid');
const dialog=document.querySelector('#productDialog');
const empty=document.querySelector('#emptyState');
const resultCount=document.querySelector('#resultCount');
const search=document.querySelector('#searchInput');
let filter='All',visible=[...products],activeIndex=0;

function money(value){return `₹${value.toLocaleString('en-IN')}`}
function render(){
  const q=search.value.trim().toLowerCase();
  visible=products.filter(p=>(filter==='All'||p.category===filter)&&(`${p.name} ${p.code} ${p.fabric} ${p.category}`.toLowerCase().includes(q)));
  grid.innerHTML=visible.map(p=>`<button class="product-card" data-id="${p.id}" aria-label="View ${p.name} details">
    <div class="product-visual"><img loading="lazy" src="${p.image}" alt="${p.name} kurti, full front view"><span class="product-number">${p.code}</span><span class="tap-mark">↗</span></div>
    <div class="product-info"><p class="product-category">${p.category}</p><h3>${p.name}</h3><div class="product-meta"><span>${p.fabric}</span><strong>${money(p.price)}</strong></div></div>
  </button>`).join('');
  empty.style.display=visible.length?'none':'block'; resultCount.textContent=`${visible.length} style${visible.length===1?'':'s'}`;
  grid.querySelectorAll('.product-card').forEach(card=>card.addEventListener('click',()=>openProduct(Number(card.dataset.id))));
}
function openProduct(productId){
  const product=products.find(p=>p.id===productId); activeIndex=products.indexOf(product);
  document.querySelector('#detailImage').src=product.image; document.querySelector('#detailImage').alt=`${product.name} full dress view`;
  ['neckZoom','fabricZoom','hemZoom'].forEach(key=>document.querySelector(`#${key}`).style.backgroundImage=`url('${product.image}')`);
  document.querySelector('#detailCollection').textContent=product.category;
  document.querySelector('#detailName').textContent=product.name;
  document.querySelector('#detailCode').textContent=`${product.code} • DRESS-ONLY DETAIL VIEW`;
  document.querySelector('#detailDescription').textContent=product.description;
  document.querySelector('#detailPrice').textContent=money(product.price);
  document.querySelector('#detailFabric').textContent=product.fabric;
  dialog.showModal(); document.body.style.overflow='hidden';
}
function closeDialog(){dialog.close();document.body.style.overflow=''}
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filter.active').classList.remove('active');button.classList.add('active');filter=button.dataset.filter;render()}));
search.addEventListener('input',render);
document.querySelector('#searchToggle').addEventListener('click',()=>{const panel=document.querySelector('#searchPanel');panel.classList.toggle('open');if(panel.classList.contains('open')){document.querySelector('#collection').scrollIntoView({behavior:'smooth'});setTimeout(()=>search.focus(),450)}});
document.querySelector('#dialogClose').addEventListener('click',closeDialog);
document.querySelector('#prevProduct').addEventListener('click',()=>openProduct(products[(activeIndex-1+products.length)%products.length].id));
document.querySelector('#nextProduct').addEventListener('click',()=>openProduct(products[(activeIndex+1)%products.length].id));
dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog()});
document.addEventListener('keydown',event=>{if(!dialog.open)return;if(event.key==='ArrowRight')document.querySelector('#nextProduct').click();if(event.key==='ArrowLeft')document.querySelector('#prevProduct').click()});
render();
