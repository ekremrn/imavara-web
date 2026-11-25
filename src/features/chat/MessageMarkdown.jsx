import React from 'react'
import Markdown from 'react-markdown'

// Asset previews and their actions come from the tool's structured cards.
// Older replies can also contain Markdown for the same preview.
export function MessageMarkdown({text, cards = []}) {
  function image({src, alt}) {
    if (cards.some(card => card.preview_url === src)) return null
    return alt || null
  }

  return <div className="message-markdown">
    <Markdown skipHtml components={{img: image}}>{text}</Markdown>
  </div>
}
