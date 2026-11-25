export async function request(path, options) {
  const response = await fetch('/v1' + path, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || (data.status === 'duplicate' ? 'Bu görsel katalogda zaten var.' : 'İşlem tamamlanamadı.'))
  return data
}
