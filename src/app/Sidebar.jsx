import React, {useEffect, useRef, useState} from 'react'

const links = [
  ['new', 'Yeni sohbet', 'M12 5v14M5 12h14'],
  ['discover', 'Keşfet', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15.5 8.5l-2 5-5 2 2-5z'],
  ['contribute', 'Kataloğa katkı', 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5'],
  ['library', 'Kitaplık', 'M4 4h4v16H4zM10 4h3v16h-3zM15 5l3-1 4 15-3 1z']
]

export function Sidebar({view, activeId, chats, onNavigate, onOpen, onDelete, locked, drawer, closeDrawer}) {
  const [collapsed, setCollapsed] = useState(false)
  const dialog = useRef(null)
  useEffect(() => {
    if (drawer) dialog.current.showModal()
    else dialog.current.close()
  }, [drawer])
  useEffect(() => {
    const desktop = matchMedia('(min-width: 761px)')
    const resize = () => { if (desktop.matches) dialog.current.close() }
    desktop.addEventListener('change', resize)
    return () => desktop.removeEventListener('change', resize)
  }, [])

  function panel(compact, mobile) {
    return <>
      <div className="side-head">
        <button className="brand" aria-label="Imavara, yeni sohbet" disabled={locked} onClick={() => onNavigate('new')}>
          {compact ? <img src="/imavara.svg" alt="" width="32"/> : 'imavara.'}
        </button>
        <button className="panel-toggle" aria-label={mobile ? 'Menüyü kapat' : compact ? 'Paneli genişlet' : 'Paneli daralt'} onClick={mobile ? closeDrawer : () => setCollapsed(!collapsed)}>{mobile ? '×' : compact ? '»' : '«'}</button>
      </div>
      <nav aria-label="Ana menü">{links.map(([key, label, path]) =>
        <button key={key} title={label} aria-label={label} disabled={key === 'new' && locked}
          aria-current={view === key ? 'page' : undefined} onClick={() => onNavigate(key)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path}/></svg>{!compact && label}
        </button>)}</nav>
      {!compact && <section className="history"><h2>Sohbetler</h2>
        {chats.map(chat => <div className="history-row" key={chat.id} data-active={view === 'chat' && activeId === chat.id}>
          <button title={chat.title} disabled={locked && activeId !== chat.id} onClick={() => onOpen(chat.id)}>{chat.title}</button>
          <button disabled={locked} aria-label={chat.title + ' sohbetini sil'} onClick={() => onDelete(chat.id)}>Sil</button>
        </div>)}
        {!chats.length && <small>Henüz sohbet yok.</small>}
      </section>}
    </>
  }
  return <>
    <aside className={'sidebar desktop' + (collapsed ? ' compact' : '')}>{panel(collapsed, false)}</aside>
    <dialog ref={dialog} className="drawer" aria-label="Gezinme" onClose={closeDrawer} onClick={e => {
      if (e.target === dialog.current && e.clientX > dialog.current.getBoundingClientRect().right) closeDrawer()
    }}>{panel(false, true)}</dialog>
  </>
}
