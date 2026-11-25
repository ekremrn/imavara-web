import React,{useEffect,useState} from 'react'
import {request} from '../../api/client'
import {AssetCard} from '../../components/AssetCard'
const json={ 'Content-Type':'application/json' }
function fileURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
export function Gallery({view,onVary,onBalance,initialReference}) {
 const library=view==='library'
 const [items,setItems]=useState([]),[popular,setPopular]=useState([]),[query,setQuery]=useState(''),[ratio,setRatio]=useState(''),[color,setColor]=useState('')
 const [ref,setRef]=useState(null)
 const [status,setStatus]=useState(''),[error,setError]=useState(''),[mode,setMode]=useState('latest')
 async function load(offset=0){
  const data=await request((library?'/me/assets':'/assets')+'?offset='+offset)
  setItems(prev=>offset?[...prev,...data.items]:data.items);setMode('latest')
  if(!library)setPopular((await request('/stats/assets?metric=acquisitions&days=30')).items.filter(c=>c.count>0).slice(0,6))
 }
 async function search(asset){
  setStatus('Katalogda aranıyor…');setError('')
  try {
   const filters={};if(ratio)filters.aspect_ratio=ratio;if(color)filters.color_family=color
   const body={query,filters,include_nearest:true};if(asset)body.reference_asset_id=asset.id;else if(ref)body.image_data_url=await fileURL(ref)
   const data=await request('/search',{method:'POST',headers:json,body:JSON.stringify(body)})
   setItems(data.nearest?[data.nearest]:data.items);setMode('search');setPopular([])
  }catch(e){setError(e.message)}finally{setStatus('')}
 }
 useEffect(()=>{if(initialReference)search(initialReference);else load().catch(e=>setError(e.message))},[])
 const card=c=><AssetCard key={c.id} card={c} library={library} onVary={onVary} onSimilar={search} refresh={async()=>{await onBalance();if(library)await load()}}/>
 return <section className="gallery"><h1 className={library ? undefined : 'discover-title'}>{library?'Kitaplık':'Keşfet'}</h1>
 {!library&&<form onSubmit={e=>{e.preventDefault();search(null)}}><input placeholder="Katalogda ara…" aria-label="Katalog sorgusu" value={query} onChange={e=>setQuery(e.target.value)}/>
 <select aria-label="Oran" value={ratio} onChange={e=>setRatio(e.target.value)}><option value="">Tüm oranlar</option>{['1:1','4:3','3:4','16:9','9:16'].map(r=><option key={r}>{r}</option>)}</select>
 <select aria-label="Renk" value={color} onChange={e=>setColor(e.target.value)}><option value="">Tüm renkler</option>{['blue','green','white','black','beige','red'].map(c=><option key={c}>{c}</option>)}</select>
 <label className="attach">{ref?.name || 'Referans seç'}<input type="file" aria-label="Arama için referans görsel" accept="image/jpeg,image/png" onChange={e=>setRef(e.target.files[0])}/></label><button className="send" disabled={!!status}>Ara</button></form>}
 <p role="status">{status||error}</p>
 {!!popular.length&&<><h2>En çok edinilenler</h2><div className="grid">{popular.map(card)}</div></>}
 {!library&&<h2>{mode==='latest'?'Son yüklenenler':'Arama sonuçları'}</h2>}
 {items.length?<div className="grid">{items.map(card)}</div>:<p>{mode==='search'?'Bu aramaya uygun görsel bulunamadı.':library?'Kitaplığında henüz görsel yok.':'Katalogda henüz yayımlanmış görsel yok.'}</p>}
 {mode==='latest'&&items.length>0&&items.length%30===0&&<button onClick={()=>load(items.length).catch(e=>setError(e.message))}>Daha fazla göster</button>}</section>
}
