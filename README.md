# Imavara web

Yerel API’yi server reposundaki Compose kurulumu ile başlat. Node 22.12+ ile bu repoda `npm ci`, ardından `npm run dev` çalıştır. Vite’ın gösterdiği yerel adresi aç. Geliştirme sunucusu HTTP ve WebSocket trafiğini `http://127.0.0.1:18080` adresine iletir. Farklı API portu için `IMAVARA_API_URL` ayarlanabilir. Derlemeyi `npm run build` ile doğrula.
