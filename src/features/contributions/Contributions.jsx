import React, {useEffect, useRef, useState} from 'react'
import {request} from '../../api/client'

const outcomes = {accepted: 'Kabul edildi', rejected: 'Kabul edilmedi', review: 'İncelemede', published: 'Yayımlandı'}

function Thumbnail({file}) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const src = URL.createObjectURL(file)
    setUrl(src)
    return () => URL.revokeObjectURL(src)
  }, [file])
  return url && <img src={url} alt=""/>
}

export function Contributions({onBalance}) {
  const [rows, setRows] = useState([])
  const [shared, setShared] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState('')
  const [busy, setBusy] = useState(false)
  const picker = useRef(null), nextId = useRef(0), dragDepth = useRef(0)
  const pending = rows.filter(row => row.state === 'ready')
  function add(files) {
    if (busy || !files.length) return
    const entries = Array.from(files, file => {
      const valid = ['image/jpeg','image/png'].includes(file.type)
      return {file, id: ++nextId.current, state: valid ? 'ready' : 'invalid',
        label: valid ? 'Hazır' : 'JPEG veya PNG seçin.'}
    })
    setRows(previous => [...previous, ...entries])
    setProgress('')
  }
  function update(id, state, label) {
    setRows(previous => previous.map(row => row.id === id ? {...row, state, label} : row))
  }
  async function upload() {
    if (busy || !shared || !pending.length) return
    setBusy(true)
    setProgress('0 / ' + pending.length + ' tamamlandı')
    for (const [index, row] of pending.entries()) {
      const body = new FormData()
      body.append('image', row.file)
      body.append('license_scope', 'shared')
      update(row.id, 'sending', 'Yükleniyor…')
      try {
        const data = await request('/contributions', {method: 'POST', body})
        update(row.id, 'done', outcomes[data.status] || 'Paylaşım isteği işlendi.')
      } catch (error) {
        update(row.id, 'failed', error.message)
      }
      setProgress((index + 1) + ' / ' + pending.length + ' tamamlandı')
    }
    try { await onBalance() }
    catch { setProgress(text => text + ' · Bakiye güncellenemedi.') }
    finally { setBusy(false) }
  }
  return <section className="contribution">
    <h1>Kataloğa katkı</h1>
    <div className={'dropzone' + (dragging ? ' dragging' : '')}
      onDragEnter={e => {e.preventDefault(); dragDepth.current++; setDragging(!busy)}}
      onDragOver={e => {e.preventDefault(); e.dataTransfer.dropEffect = busy ? 'none' : 'copy'}}
      onDragLeave={() => {if (--dragDepth.current <= 0) setDragging(false)}}
      onDrop={e => {e.preventDefault(); dragDepth.current = 0; setDragging(false); add(e.dataTransfer.files)}}>
      <span className="upload-icon" aria-hidden="true">↑</span>
      <h2>Fotoğrafları buraya bırak</h2><p>Birden fazla JPEG veya PNG ekleyebilirsin.</p>
      <button className="select-files" disabled={busy} onClick={() => picker.current.click()}>Fotoğraf seç</button>
      <input hidden ref={picker} type="file" multiple accept="image/jpeg,image/png" onChange={e => {add(e.target.files); e.target.value = ''}}/>
    </div>
    <ul className="upload-list">{rows.map(row => <li key={row.id}>
      {row.state !== 'invalid' && <Thumbnail file={row.file}/>}
      <div><strong>{row.file.name}</strong><small>{row.label}</small></div>
      <button disabled={busy} aria-label={row.file.name + ' dosyasını kaldır'} onClick={() => setRows(prev => prev.filter(item => item.id !== row.id))}>×</button>
    </li>)}</ul>
    <div className="upload-actions"><label><input type="checkbox" checked={shared} disabled={busy} onChange={e => setShared(e.target.checked)}/> Ortak kullanım için paylaşma iznim var.</label>
      <button className="send" disabled={busy || !shared || !pending.length} onClick={upload}>Yükle{pending.length ? ' · ' + pending.length : ''}</button></div>
    <p role="status">{progress}</p>
  </section>
}
