import React, {useLayoutEffect, useRef, useState} from 'react'

export function ZoomPreview({card}) {
  const trigger = useRef(null)
  const dialog = useRef(null)
  const photo = useRef(null)
  const closing = useRef(false)
  const [open, setOpen] = useState(false)

  function animatePhoto(reverse = false) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    for (const animation of photo.current.getAnimations()) animation.cancel()
    const from = trigger.current.getBoundingClientRect()
    const to = photo.current.getBoundingClientRect()
    if (!to.width || !to.height) return
    const thumbnail = {
      transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`
    }
    const full = {transform: 'none'}
    return photo.current.animate(reverse ? [full, thumbnail] : [thumbnail, full], {
      duration: reverse ? 170 : 240, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both'
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    dialog.current.showModal()
    animatePhoto()
  }, [open])

  async function close() {
    if (closing.current) return
    closing.current = true
    await animatePhoto(true)?.finished.catch(() => {})
    dialog.current?.close()
    setOpen(false)
    closing.current = false
    trigger.current?.focus({preventScroll: true})
  }

  const alt = card.caption || 'Görsel önizlemesi'
  return <>
    <button type="button" className="zoom-trigger" ref={trigger} aria-label={'Görseli büyüt · ' + alt}
      aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <img loading="lazy" width={card.width} height={card.height} src={card.preview_url} alt={alt}/>
    </button>
    {open && <dialog className="zoom-dialog" ref={dialog} aria-label="Büyük önizleme"
      onCancel={event => {event.preventDefault(); close()}}
      onClick={event => {if (event.target === dialog.current) close()}}>
      <img ref={photo} src={card.preview_url} alt={alt} width={card.width} height={card.height}
        style={{width: `min(92vw, ${86 * card.width / card.height}dvh)`}}/>
      <button type="button" aria-label="Önizlemeyi kapat" className="zoom-close" onClick={close}>×</button>
    </dialog>}
  </>
}
