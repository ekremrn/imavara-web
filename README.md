# Imavara Web

Imavara’nın React ve Vite ile çalışan tarayıcı arayüzü. Ana ekrana aradığın fotoğrafı yazabilir, sesle tarif edebilir veya bir referans görsel ekleyebilirsin. Sohbet, sonuçları önizleme, benzerlik skoru ve indirme eylemi olan kartlarla sunar. [Backend ve mimari çizimler](https://github.com/ekremrn/imavara-server#sistem-nasıl-çalışır)

## Arayüzde neler var?

- **Sohbet** üzerinden görsel ara, yeni bir fotoğraf iste veya seçtiğin karttan varyasyon üret. Önceki konuşmaları aynı tarayıcıda yeniden açabilirsin.
- **Keşfet** üzerinden ortak kataloğu gez, metinle veya referans görselle ara ve sonuçları filtrele. Fotoğrafa tıklayarak büyütebilir, üzerindeki düğmeyle orijinali indirebilirsin.
- **Kitaplık** ürettiğin ve edindiğin görselleri bir arada gösterir. Yeni tarayıcı oturumu 100 krediyle başlar. Arama ve önizleme ücretsizdir. İlk edinim 1 kredi, üretim veya varyasyon 3 kredidir. Edinilmiş bir orijinali tekrar indirmek ücretsizdir.

## Yerel kurulum

Önce backend’i Docker Compose ile başlat. Arayüzün varsayılan API adresi `http://127.0.0.1:18080`. [Server kurulum yönergesi](https://github.com/ekremrn/imavara-server#yerel-kurulum)

Node.js 22.12 veya üstüyle bu repo kökünde çalıştır:

```sh
npm ci
npm run dev
```

Terminalde Vite’ın gösterdiği adresi aç. Tarayıcı aynı origin üzerinden çalışır. Vite, `/v1` isteklerini ve sohbet WebSocket bağlantısını API’ye iletir. API başka bir adresteyse `IMAVARA_API_URL` ortam değişkenini Vite’ı başlatırken ayarla. Ses kaydı için tarayıcıda mikrofon izni ve HTTPS veya localhost gerekir.

Derlemeyi ve yerel önizlemeyi çalıştırmak için:

```sh
npm run build
npm run preview
```

[Geliştirme rehberi](AGENTS.md) · [Değişiklik geçmişi](CHANGELOG.md)
