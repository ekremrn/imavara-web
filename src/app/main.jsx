import React, {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {request} from '../api/client'
import {recordVoice} from '../features/chat/voice'
import {Gallery} from '../features/discover/Gallery'
import {AssetCard} from '../components/AssetCard'
import {MessageMarkdown} from '../features/chat/MessageMarkdown'
import {Sidebar} from './Sidebar'
import {Contributions} from '../features/contributions/Contributions'
import './style.css'

function createTurnId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // On a LAN HTTP origin, getRandomValues is available even without randomUUID.
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

function App() {
 const [account,setAccount]=useState(null), [draft,setDraft]=useState(''), [id,setId]=useState(null)
 const [messages,setMessages]=useState([]),[status,setStatus]=useState(''),[error,setError]=useState('')
 const [recording,setRecording]=useState(false),[seconds,setSeconds]=useState(0),[chats,setChats]=useState([])
 const busy=useRef(false), recorder=useRef(null),socket=useRef(null),scrollPane=useRef(null)
 const [view,setView]=useState('chat'),[reference,setReference]=useState(null),[similar,setSimilar]=useState(null)
 const [drawer,setDrawer]=useState(false), [ready,setReady]=useState(false)
 const [turnState,setTurnState]=useState(null), [away,setAway]=useState(false)
 const stick=useRef(true), composer=useRef(null), startTop=useRef(null), openVersion=useRef(0)
 const active=Boolean(id || messages.length)
 useLayoutEffect(()=>{
   if(startTop.current === null || !composer.current)return
   const dy=startTop.current-composer.current.getBoundingClientRect().top
   startTop.current=null
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
     composer.current.animate([{transform:'translateY('+dy+'px)'},{transform:'translateY(0)'}],{duration:240,easing:'ease-out'})
 },[active])
 function follow(){stick.current=true;setAway(false)}
 useLayoutEffect(()=>{
   const pane=scrollPane.current
   if(pane && stick.current)pane.scrollTop=pane.scrollHeight
 },[messages,turnState,view])
 async function refreshChats(){setChats((await request('/conversations')).items || [])}
 useEffect(()=>{
   let mounted=true
   async function restore(){
     const me=await request('/me')
     if(!mounted)return
     setAccount(me)
     const saved=sessionStorage.getItem('imavara.chat.'+me.id)
     if(saved){try{const chat=await request('/conversations/'+saved);if(mounted){setId(saved);setMessages(chat.items || [])}}catch{sessionStorage.removeItem('imavara.chat.'+me.id)}}
     if(mounted)await refreshChats()
   }
   restore().catch(e=>setError(e.message)).finally(()=>{if(mounted)setReady(true)})
   return ()=>{mounted=false;socket.current?.close();recorder.current?.cancel()}
 },[])
 useEffect(()=>{if(account&&id)sessionStorage.setItem('imavara.chat.'+account.id,id)},[id,account?.id])
 function forgetChat(){if(account)sessionStorage.removeItem('imavara.chat.'+account.id);setId(null);setMessages([])}
 useEffect(()=>{if(!recording)return; const t=setInterval(()=>setSeconds(s=>s+1),1000);return ()=>clearInterval(t)},[recording])

 async function deleteChat(chat){
   if(busy.current)return
   busy.current=true;setStatus('Sohbet siliniyor…');openVersion.current++
   try{await request('/conversations/'+chat,{method:'DELETE'});if(id===chat)forgetChat();await refreshChats()}catch(e){setError(e.message)}finally{busy.current=false;setStatus('')}
 }
 async function openChat(chat) {
   if(chat===id){setDrawer(false);setView('chat');return}
   if(busy.current)return
   const version=++openVersion.current
   try{
     const data=await request('/conversations/'+chat)
     if(version!==openVersion.current)return
     follow();setView('chat');setId(chat);setMessages(data.items || []);setDrawer(false);setReference(null);setDraft('');setError('')
   }catch(e){if(version===openVersion.current)setError(e.message)}
 }
 async function send(text) {
   if(!text.trim() || busy.current || !ready)return
   openVersion.current++
   const turn=createTurnId()
   const previous=messages
   const attached=reference
   const phase=(label,streaming=false)=>setTurnState({turn,label,streaming})
   if(!active)startTop.current=composer.current?.getBoundingClientRect().top ?? null
   busy.current=true;follow();setStatus('');setError('');setDraft('');setReference(null)
   setMessages(prev=>[...prev,{turn_id:turn,role:'user',content:text},{turn_id:turn,role:'assistant',content:''}])
   phase('Gönderiliyor…')
   function restoreDraft(){setDraft(text);setReference(attached)}
   try{
    const chat=id || (await request('/conversations',{method:'POST'})).id
    setId(chat)
    const ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/v1/conversations/'+chat+'/ws')
    socket.current=ws
    let submitted=false
    ws.onopen=()=>{
      ws.send(JSON.stringify({turn_id:turn,text,reference_asset_id:attached?.id}))
      submitted=true;phase('Yanıt hazırlanıyor…')
      setChats(prev=>prev.some(item=>item.id===chat)?prev:[{id:chat,title:text.slice(0,72)},...prev])
    }
    ws.onmessage=({data})=>{
     const e=JSON.parse(data)
     if(e.type==='delta'){
       phase('',true)
       setMessages(prev=>[...prev.slice(0,-1),{...prev.at(-1),content:prev.at(-1).content+e.text}])
     }
     if(e.type==='tool')phase(({generate_image:'Görsel oluşturuluyor…',get_image:'Görsel getiriliyor…',search_images:'Katalogda aranıyor…','Katalogda aranıyor…':'Katalogda aranıyor…'})[e.text] || 'Yanıt hazırlanıyor…')
     if(e.type==='cards'){
       phase('')
       setMessages(prev=>[...prev.slice(0,-1),{...prev.at(-1),cards:e.cards}])
     }
     if(e.type==='error'){phase('');setError(e.text)}
     if(e.type==='done')phase('')
    }
    ws.onerror=()=>setError('Sohbet bağlantısı kesildi.')
    ws.onclose=async()=>{
     if(!submitted){restoreDraft();setMessages(previous)}
     try {
       const deadline=Date.now()+245000
       for(;;){
         let saved
         try{saved=await request('/conversations/'+chat)}catch(e){
           if(!submitted||Date.now()>=deadline)throw e
         }
         if(saved){
           if(!submitted||(saved.items || []).some(m=>m.turn_id===turn&&m.role==='assistant')){setMessages(saved.items || []);break}
           if(!(saved.items || []).some(m=>m.turn_id===turn)){setMessages(saved.items || []);restoreDraft();setError('Mesaj kaydedilemedi. Tekrar gönderebilirsin.');break}
         }
         if(Date.now()>=deadline){setError('Yanıt henüz tamamlanmadı. Sohbet geçmişinden tekrar açabilirsin.');break}
         phase('Sohbet güncelleniyor…')
         await new Promise(resolve=>setTimeout(resolve,1200))
       }
       await Promise.all([balance(), refreshChats()])
     }catch(e){setError(e.message)}finally{busy.current=false;setTurnState(null);setStatus('')}
    }
   }catch(e){restoreDraft();setMessages(previous);busy.current=false;setTurnState(null);setStatus('');setError(e.message)}
 }
 async function attach(file) {
   if(!file || busy.current)return
   busy.current=true;setStatus('Referans yükleniyor…');setError('')
   try{const body=new FormData();body.append('image',file);const asset=await request('/references',{method:'POST',body});setReference({...asset,caption:file.name})}
   catch(e){setError(e.message)}finally{busy.current=false;setStatus('')}
 }
 async function startVoice(){
   if(busy.current)return
   busy.current=true;setStatus('Mikrofon açılıyor…');setError('')
   try{recorder.current=await recordVoice();setRecording(true);setSeconds(0)}
   catch{setError('Mikrofon açılamadı. Tarayıcının mikrofon iznini kontrol et.')}
   finally{busy.current=false;setStatus('')}
 }
 async function submit(event){
   event.preventDefault()
   if(busy.current)return
   if(!recording){await send(draft);return}
   busy.current=true;setRecording(false);setStatus('Ses yazıya çevriliyor…')
   try{const text=await recorder.current.transcribe();busy.current=false;await send([draft,text].filter(Boolean).join(' '))}
   catch(e){busy.current=false;setStatus('');setError(e.message)}
 }
 const balance=async()=>setAccount(await request('/me'))
 function navigate(next){
   openVersion.current++;setDrawer(false)
   if(next==='new'){
     if(busy.current||recording)return
     follow();forgetChat();setReference(null);setDraft('');setError('');setView('chat')
   }else{setView(next);setSimilar(null)}
 }
 function vary(c){if(busy.current||recording)return;setReference(c);setView('chat');setDraft('Bu görselde ')}
 function find(c){setSimilar(c);setView('discover')}
 const title={discover:'Keşfet',contribute:'Kataloğa katkı',library:'Kitaplık',chat:chats.find(c=>c.id===id)?.title || messages.find(m=>m.role==='user')?.content || 'Yeni sohbet'}[view]
 return <main className="app-shell">
  <Sidebar view={view} activeId={id} chats={chats} locked={!ready||busy.current||recording} drawer={drawer} closeDrawer={()=>setDrawer(false)} onNavigate={navigate} onOpen={openChat} onDelete={deleteChat}/>
  <div className="main-pane">
  <header className="topbar"><button className="menu-toggle" aria-label="Menüyü aç" onClick={()=>setDrawer(true)}>☰</button><span className="page-title">{title}</span><span className="credit">{account?.balance??'—'} kredi</span></header>
  {view==='chat' && <section className={'workspace page-enter '+(active?'in-chat':'welcome')}>
   <div className="welcome-title" aria-hidden={active}><h1>Nasıl bir görsel <em>arıyorsun?</em></h1></div>
   {active && <article ref={scrollPane} onScroll={e=>{
     const pane=e.currentTarget
     stick.current=pane.scrollHeight-pane.clientHeight-pane.scrollTop<64
     setAway(!stick.current)
   }}><div className="thread">{messages.map((m,i)=>{
     const live=m.role==='assistant' && m.turn_id===turnState?.turn && turnState
     return <div key={(m.turn_id || i)+m.role} className={m.role}>
       {m.content && <div className={live?.streaming?'streaming':''}><MessageMarkdown text={m.content} cards={m.cards ?? []}/></div>}
       {live?.label && <div className="thinking" role="status">{live.label}</div>}
       {!!m.cards?.length && <div className="card-grid">{m.cards.map(c=><AssetCard key={c.id} card={c} onSimilar={find} onVary={vary} refresh={balance}/>)}</div>}
     </div>
   })}</div></article>}
   {active && away && <button className="jump" onClick={()=>{follow();scrollPane.current.scrollTop=scrollPane.current.scrollHeight}}>Son yanıta dön ↓</button>}
   <form ref={composer} className="composer" onSubmit={submit}>
    {reference&&<button type="button" onClick={()=>setReference(null)}>Referans · {reference.caption||reference.id} ×</button>}
    <textarea readOnly={!!turnState} placeholder="Aklındaki görseli anlat…" aria-label="Görsel tarifi" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form.requestSubmit()}}}/>
    <div className="actions"><label className="attach">Referans ekle<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Referans görsel ekle" disabled={recording||busy.current} onChange={e=>{attach(e.target.files[0]);e.target.value=''}}/></label>{recording?<button type="button" onClick={()=>{recorder.current.cancel();setRecording(false)}}>● {seconds} sn · İptal</button>:<button type="button" onClick={startVoice}>Sesle anlat</button>}
    <button className="send" disabled={!ready||busy.current||(!draft.trim()&&!recording)}>Gönder ↑</button></div>
   </form>{status && <div className="notice" role="status">{status}</div>}
  </section>}
  {(view==='discover'||view==='library') && <div className="page-body page-enter" key={view}><Gallery key={similar?.id} view={view} onVary={vary} onBalance={balance} initialReference={view==='discover'?similar:null}/></div>}
  <div className="page-body page-enter" hidden={view!=='contribute'}><Contributions onBalance={balance}/></div>
  {error && <div className="notice" role="alert">{error}</div>}
  <footer>Üretilen görseller kabul edildiğinde ortak katalogda yayımlanır. Sohbet, görsel üretimi ve analizde Meta Muse modellerini kullanıyoruz.</footer>
  </div>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>)
