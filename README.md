# X/Twitter Bulk Muted Words Script

Bu Tampermonkey scripti, X (eski Twitter) platformunda futbol ile ilgili kelimeleri toplu olarak sessize alma listesine eklemenizi sağlar.

## 🎯 Özellikler

- **Toplu Ekleme**: 70+ futbol kelimesini otomatik olarak mute listesine ekler
- **Çok Dilli Destek**: Türkçe ve İngilizce futbol terimleri
- **Akıllı Bekleme**: X'in rate limitlerini bypass etmek için optimized timing
- **İlerleme Takibi**: Gerçek zamanlı progress gösterimi
- **Hata Koruması**: Güvenli exception handling ve retry mekanizması
- **SPA Uyumluluğu**: X'in Single Page Application yapısına uyumlu

## 📋 Kelime Listesi

Script aşağıdaki kategorilerde kelimeleri içerir:

### Türkçe Terimler
- **Temel**: futbol, maç, gol, hakem, penaltı, derbi vb.
- **Organizasyon**: süper lig, şampiyonlar ligi, dünya kupası vb.
- **Kulüpler**: galatasaray, fenerbahçe, beşiktaş, trabzonspor vb.

### İngilizce Terimler  
- **Temel**: football, soccer, goal, referee, penalty vb.
- **Ligler**: premier league, laliga, serie a, bundesliga vb.
- **Oyuncular**: ronaldo, messi, haaland, mbappé vb.

## 🛠️ Kurulum

### 1. Tampermonkey Kurulumu

**Chrome/Edge:**
1. [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)'dan Tampermonkey'i kurun

**Firefox:**
1. [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)'dan Tampermonkey'i kurun

**Safari:**
1. [App Store](https://apps.apple.com/us/app/tampermonkey/id1482490089)'dan Tampermonkey'i kurun

### 2. Script Kurulumu

1. Tampermonkey dashboard'unu açın (simgesine tıklayıp "Dashboard" seçin)
2. **"Create a new script"** butonuna tıklayın
3. Açılan editörde mevcut kodu silin
4. Script kodunu yapıştırın
5. **Ctrl+S** (veya Cmd+S) ile kaydedin

## 🚀 Kullanım

### Adım 1: X'e Giriş Yapın
- [x.com](https://x.com) adresine gidin ve hesabınıza giriş yapın

### Adım 2: Mute Ayarlarına Gidin
Aşağıdaki yöntemlerden birini kullanın:

**Yöntem 1: Direkt Link**
- Bu linke tıklayın: https://x.com/settings/muted_keywords

**Yöntem 2: Manuel**
1. Profil fotoğrafınıza tıklayın
2. "Settings and privacy" / "Ayarlar ve gizlilik" seçin
3. "Privacy and safety" / "Gizlilik ve güvenlik" seçin  
4. "Mute and block" / "Sessize alma ve engelleme" seçin
5. "Muted words" / "Sessize alınmış kelimeler" seçin

### Adım 3: Script'i Çalıştırın
1. Muted keywords sayfasında olduğunuzdan emin olun
2. Script otomatik olarak çalışmaya başlayacak
3. Onay dialogunda **"Tamam"** veya **"OK"** butonuna tıklayın
4. İşlemin tamamlanmasını bekleyin (yaklaşık 2-3 dakika)

## 📊 İzleme

Script çalışırken şunları görebilirsiniz:

- **Console Logları**: F12 tuşuna basıp Console sekmesinde detaylı loglar
- **Title Bar**: Tarayıcı sekmesinde progress yüzdesi
- **Progress Mesajları**: Her 10 kelimede ilerleme raporu

## ⚙️ Konfigürasyon

### Kelime Listesini Özelleştirme

Script dosyasındaki `words` dizisini düzenleyerek kendi kelimelerinizi ekleyebilirsiniz:

```javascript
const words = [
  // Kendi kelimelerinizi buraya ekleyin
  "özel-kelime1",
  "özel-kelime2",
  // ...
];
```

### Timing Ayarları

Daha hızlı/yavaş çalışma için timing değerlerini değiştirebilirsiniz:

```javascript
// Kelimeler arası bekleme (ms)
await sleep(Math.random() * 500 + 500); // 500-1000ms arası

// İşlem tamamlanma bekleme
const maxWait = 60; // 9 saniye
```

## 🔧 Sorun Giderme

### Script Çalışmıyor
1. **Sayfa Kontrolü**: `/settings/muted_keywords` sayfasında olduğunuzdan emin olun
2. **Console Kontrolü**: F12 > Console'da hata mesajları kontrol edin
3. **Tampermonkey Kontrolü**: Tampermonkey'in aktif olduğunu kontrol edin

### İşlem Yarıda Kesiliyor
1. **Sayfa Yenileme**: Sayfayı yenileyin ve tekrar deneyin  
2. **Rate Limit**: X'in geçici sınırlaması olabilir, biraz bekleyin
3. **Manuel Devam**: Kaldığı yerden devam etmek için sayfayı yenileyin

### Kelimeler Eklenmiyor
1. **Input Alanı**: Kelime ekleme sayfasının doğru yüklendiğini kontrol edin
2. **JavaScript Hatası**: Console'da JavaScript hataları olup olmadığını kontrol edin
3. **X Güncelleme**: X'in arayüzü değişmişse script'in güncellenmesi gerekebilir

## 📝 Teknik Detaylar

- **Platform**: Tampermonkey/Greasemonkey
- **Hedef**: x.com, twitter.com
- **Teknoloji**: Vanilla JavaScript, DOM manipulation
- **React Uyumluluğu**: React controlled input handling
- **SPA Desteği**: MutationObserver ile navigation handling

## ⚠️ Önemli Notlar

1. **Rate Limiting**: X'in spam koruması nedeniyle script yavaş çalışır
2. **Kesinti Riski**: Çok hızlı işlem yaparsa X hesabınızı geçici olarak kısıtlayabilir
3. **Manual Backup**: Önemli mute listelerinizin yedeğini alın
4. **Browser Compatibility**: Modern browserlar gereklidir (Chrome 70+, Firefox 60+)

## 🔄 Güncellemeler

Script otomatik güncellenmez. Yeni sürümler için:

1. Bu repository'yi takip edin
2. Yeni versiyonu manuel olarak güncelleyin
3. Version number'ı kontrol edin (`@version` line)

## 📄 Lisans

Bu script kişisel kullanım içindir. Ticari kullanım için izin gereklidir.

## 🤝 Katkıda Bulunma

- **Bug Report**: Issue açarak hataları bildirin
- **Feature Request**: Yeni özellik önerilerinizi paylaşın
- **Code Contribution**: Pull request gönderin

## 📞 Destek

Sorunlarınız için:
1. İlk önce bu README'yi okuyun
2. Console loglarını kontrol edin  
3. Issue açarak detaylı bilgi verin

---

**⚡ Happy Muting! Futbol içeriklerinden kurtulun ve timeline'ınızın keyfini çıkarın!**
