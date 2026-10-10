(function(){
 const cfg=window.DIYA_CONFIG||{};
 const configured=!!(cfg.supabaseUrl&&cfg.supabasePublishableKey&&window.supabase);
 const db=configured?window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey):null;
 const fail=e=>{if(e)throw new Error(e.message||'Request failed');};
 const timed=(promise,label,ms=20000)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' timed out. Check your internet and try again.')),ms))]);
 const requireDb=()=>{if(!db)throw Error('Supabase is not configured.');return db;};
 const stallFrom=s=>s?({eventName:s.event_name,venue:s.venue,address:s.address,startDate:s.start_date,endDate:s.end_date||'',startTime:s.start_time.slice(0,5),endTime:s.end_time.slice(0,5),mapUrl:s.map_url,published:s.published}):null;
 async function load(){requireDb();const [p,s]=await timed(Promise.all([db.from('products').select('*').order('created_at',{ascending:false}),db.from('stalls').select('*').eq('id',1).maybeSingle()]),'Loading catalogue');fail(p.error);fail(s.error);return {products:p.data||[],stall:stallFrom(s.data)};}
 async function admin(){if(!db)return false;const {data,error}=await db.rpc('is_admin');fail(error);return data===true;}
 async function saveProduct(p){let image=p.image,newPath=null;
   requireDb();
   if(!p?.id||!p?.code||!p?.name)throw Error('Dress details are incomplete.');
   if(image.startsWith('data:')){const blob=await(await fetch(image)).blob();if(!blob.size)throw Error('The processed dress image is empty. Please choose the photo again.');newPath=crypto.randomUUID()+'.webp';const upload=await timed(db.storage.from('dress-images').upload(newPath,blob,{contentType:'image/webp',cacheControl:'3600',upsert:false}),'Image upload',30000);fail(upload.error);image=db.storage.from('dress-images').getPublicUrl(newPath).data.publicUrl;}
   const row={id:String(p.id),code:p.code,name:p.name,price:p.price,category:p.category,fabric:p.fabric,description:p.description||'',sizes:p.sizes||'',image};
   const result=await timed(db.from('products').upsert(row,{onConflict:'id'}).select('*').single(),'Saving dress');
   if(result.error&&newPath)await db.storage.from('dress-images').remove([newPath]);fail(result.error);return result.data;
 }
 async function cleanImage(url){const prefix=cfg.supabaseUrl+'/storage/v1/object/public/dress-images/';if(!url?.startsWith(prefix))return;const {data,error}=await db.from('products').select('id').eq('image',url).limit(1);if(error||data.length)return;await db.storage.from('dress-images').remove([decodeURIComponent(url.slice(prefix.length))]);}
 async function saveStall(s){requireDb();const result=await timed(db.from('stalls').upsert({id:1,event_name:s.eventName,venue:s.venue,address:s.address,start_date:s.startDate,end_date:s.endDate||null,start_time:s.startTime,end_time:s.endTime,map_url:s.mapUrl,published:s.published}).select('id').single(),'Saving stall');fail(result.error);return result.data;}
 async function remove(id){requireDb();const result=await timed(db.from('products').delete().eq('id',String(id)).select('id').maybeSingle(),'Deleting dress');fail(result.error);if(!result.data)throw Error('Dress was not deleted. Check the products DELETE policy in Supabase.');return true;}
 window.DiyaCloud={db,configured,load,admin,saveProduct,saveStall,cleanImage,remove};
})();
