import { request } from '../../api/client.js'

export async function recordVoice() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  try {
    const recorder = new MediaRecorder(stream)
    const chunks = []
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    const close = () => stream.getTracks().forEach(track => track.stop())
    const finished = new Promise((resolve, reject) => {
      recorder.onstop = () => { close(); resolve(new Blob(chunks, { type: recorder.mimeType })) }
      recorder.onerror = () => { close(); reject(new Error('Ses kaydı kesildi.')) }
    })
    finished.catch(() => {})
    recorder.start()
    return {
      cancel() { if (recorder.state !== 'inactive') recorder.stop(); close() },
      async transcribe() {
        if (recorder.state !== 'inactive') recorder.stop()
        const audio = await finished
        const body = new FormData()
        body.append('audio', audio, 'recording')
        const { text } = await request('/audio/transcriptions?language=' + encodeURIComponent(document.documentElement.lang), { method: 'POST', body })
        return text
      }
    }
  } catch (error) {
    stream.getTracks().forEach(track => track.stop())
    throw error
  }
}
