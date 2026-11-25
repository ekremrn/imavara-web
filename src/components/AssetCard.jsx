import React,{useState} from 'react'
import {ZoomPreview} from './ZoomPreview'
import {request} from '../api/client'

export function AssetCard({card,onSimilar,onVary,refresh,library=false}) {
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 const [downloaded,setDownloaded]=useState(false)
 const downloadLabel = downloaded||card.acquired||card.owned||library ? 'İndir' : 'İndir · 1 kredi'
 async function act(action) {
  if(busy)return
  setBusy(true);setMessage('')
  try{
   if(action==='acquire'){
    const data=await request('/assets/'+card.id+'/acquire',{method:'POST'})
    const a=document.createElement('a');a.href=data.original_url;const extension=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[card.mime_type]
    a.download='imavara-'+card.id+(extension?'.'+extension:'');document.body.appendChild(a);a.click();a.remove()
    setDownloaded(true)
    setMessage(data.charged?'1 kredi · Kitaplığına eklendi.':'Orijinal hazır.')
   }else{
    await request('/assets/'+card.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({share:action==='share'})})
    setMessage(action==='share'?'Paylaşım isteği işlendi.':'Katalogdan çekildi.')
   }
   await refresh?.()
  }catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 return <section className="asset"><div className="asset-preview"><ZoomPreview card={card}/>
 <button type="button" className="quick-download" disabled={busy} onClick={()=>act('acquire')}><span aria-hidden="true">↓</span> {downloadLabel}</button></div>
 <div className="asset-info"><span>{card.width} × {card.height} · {card.aspect_ratio}</span>{card.requested_ratio && card.aspect_ratio!==card.requested_ratio && <small> İstenen oran {card.requested_ratio}. Model {card.aspect_ratio} üretti.</small>}{card.match&&<p title="Sorgu ile katalog görselinin vektörleri arasındaki kosinüs benzerliği">{card.match.level==='nearest'?'En yakın aday':'Yakın eşleşme'} · %{card.match.percent} benzerlik</p>}<p>{card.caption}</p>
 <div className="asset-actions">
 <button onClick={()=>onSimilar(card)}>Benzerlerini bul</button><button onClick={()=>onVary(card)}>Varyasyon üret · 3 kredi</button>
 {library&&card.owned&&['pending_decision','accepted'].includes(card.status)&&<small>Katalog için işleniyor</small>}
 {library&&card.owned&&!['pending_decision','accepted'].includes(card.status)&&<button disabled={busy} onClick={()=>act(card.status==='published'?'withdraw':'share')}>{card.status==='published'?'Paylaşımı kaldır':'Katalogla paylaş'}</button>}</div><small>{message}</small></div></section>
}
