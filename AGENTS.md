# Imavara web çalışma rehberi

Bu repo istemci taraflı React arayüzünü taşır. Açılış ve sohbet ana akıştır. Keşfet doğrudan katalog araması sunar. Bir değişikliğe etkilenen kullanıcı eyleminden başla ve gerçek API yanıtına kadar izle.

## Yerleşim ve davranış

Yönlendirme ve uygulama kabuğunu `src/app`, ürün ekranlarını `src/features/{chat,discover,assets,contributions,library}`, ortak kart ve kontrolleri `src/components`, HTTP ve WebSocket erişimini `src/api` altında geliştir. Aynı özelliği kullanan ekranlarda mevcut bileşeni paylaş. Tarayıcı oturumunu API çereziyle sürdür. Bakiye, fiyat, dosya hakkı ve işlem sonucu için API yanıtını göster. MCP, storage anahtarı ve model sağlayıcısı backend sınırında kalır.

## Uyumluluk ve doğrulama

İstek alanlarını, kart kimliklerini, WebSocket olay sırasını ve ücretli işlem anahtarını sunucu sözleşmesiyle eşleştir. Yeni isteğe bağlı alan eksikken önceki sunucu yanıtını ve eski konuşmaları açmayı dene. Yeni olay tipleri geldiğinde tanınan olayların işlenmesi sürmeli. Zorunlu sözleşme değişikliğini server reposundaki geçişle eşleştir. Kesilen bağlantıdan dönünce aynı mesajın ikinci kez gönderilmediğini, kart sırasının ve edinim hakkının korunduğunu dene.

Ses girişini değiştirirken açılışta ve sohbette mikrofon izni, iptal, tek Gönder ile otomatik mesaj ve hata sonrası taslağı kontrol et. Agent durumunu gerçek servis olayına bağla. İlgili ekranı klavye ve azaltılmış hareket tercihiyle de dene.

## Gözlemlenebilirlik

Yeniden deneme, arama, edinim veya indirme davranışı değiştiğinde API olaylarının ve Grafana’da izlenen sayaçların çift sayılmadığını kontrol et. Yeni bir ölçüm gerekiyorsa sunucudaki Prometheus metriği ve ilgili panelle eşleştir. Sentry etkin olduğunda istemci hatasını ekran ve işlem bağlamıyla ilişkilendir. Ham ses, sohbet metni, görsel ve çerezi hata raporuna ekleme. Yerel arayüz boş Sentry DSN ile çalışmalı.

## Değişiklik ve sürüm kaydı

Teslimden önce bağımlılıkları kilit dosyasıyla kur (`npm ci`), `npm run build` çalıştır ve değiştirdiğin akışı yerel API’ye bağlı tarayıcıda dene. Örneğin kart eylemi değiştiyse aynı görseli hem sohbetten hem Keşfet’ten aç. İlk edinimden sonra iki ekranda da güncel bakiye ve yeniden indirme hakkı görünmeli.

Kullanıcı davranışı, entegrasyon sözleşmesi, veri geçişi veya işletim gereksinimi değiştiğinde aynı commit ya da değişiklik setinde [CHANGELOG.md](CHANGELOG.md) içindeki “Yayımlanmamış” bölümüne kısa bir kayıt ekle. Etkilenen kullanıcıyı veya servisi, görünen farkı ve gerekiyorsa geçiş adımını yaz. İki repoyu etkileyen işte her repo kendi etkisini kaydeder. Önemli bir sürüm yayımlandığında ilgili kayıtları gerçek sürüm ve tarih altında topla. Henüz planlanan özelliği teslim edilmiş gibi kaydetme.
