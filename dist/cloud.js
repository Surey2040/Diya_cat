(function(){
 const cfg=window.DIYA_CONFIG||{};
 const configured=!!(cfg.supabaseUrl&&cfg.supabasePublishableKey&&window.supabase);
 const db=configured?window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey):null;
 const fail=e=>{if(e)throw new Error(e.message||'Request failed');};
 const stallFrom=s=>s?({eventName:s.event_name,venue:s.venue,address:s.address,startDate:s.start_date,endDate:s.end_date||'',startTime:s.start_time.slice(0,5),endTime:s.end_time.slice(0,5),mapUrl:s.map_url,published:s.published}):null;
 async function load(){if(!db)throw Error('Add your Supabase project URL and publishable key in config.js.');const [p,s]=await Promise.all([db.from('products').select('*').order('created_at',{ascending:false}),db.from('stalls').select('*').eq('id',1).maybeSingle()]);fail(p.error);fail(s.error);return {products:p.data,stall:stallFrom(s.data)};}
 async function admin(){if(!db)return false;const {data,error}=await db.rpc('is_admin');fail(error);return data===true;}
 async function saveProduct(p){let image=p.image,newPath=null;
   if(image.startsWith('data:')){const blob=await(await fetch(image)).blob();newPath=crypto.randomUUID()+'.webp';const upload=await db.storage.from('dress-images').upload(newPath,blob,{contentType:blob.type,upsert:false});fail(upload.error);image=db.storage.from('dress-images').getPublicUrl(newPath).data.publicUrl;}
   const row={id:String(p.id),code:p.code,name:p.name,price:p.price,category:p.category,fabric:p.fabric,description:p.description||'',sizes:p.sizes||'',image};
   const {error}=await db.from('products').upsert(row);
   if(error&&newPath)await db.storage.from('dress-images').remove([newPath]);fail(error);return row;
 }
 async function cleanImage(url){const prefix=cfg.supabaseUrl+'/storage/v1/object/public/dress-images/';if(!url?.startsWith(prefix))return;const {data,error}=await db.from('products').select('id').eq('image',url).limit(1);if(error||data.length)return;await db.storage.from('dress-images').remove([decodeURIComponent(url.slice(prefix.length))]);}
 async function saveStall(s){const {error}=await db.from('stalls').upsert({id:1,event_name:s.eventName,venue:s.venue,address:s.address,start_date:s.startDate,end_date:s.endDate||null,start_time:s.startTime,end_time:s.endTime,map_url:s.mapUrl,published:s.published});fail(error);}
 window.DiyaCloud={db,configured,load,admin,saveProduct,saveStall,cleanImage,remove:async id=>{const {error}=await db.from('products').delete().eq('id',String(id));fail(error);}};
})();
