// ==UserScript==
// @name         X/Twitter Bulk Muted Words (v1.4 improved)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Sessize alınacak kelimeleri toplu ekler (hata düzeltmeleri ve iyileştirmeler)
// @author       Volkan
// @match        https://x.com/settings/muted_keywords*
// @match        https://x.com/settings/add_muted_keyword*
// @match        https://twitter.com/settings/muted_keywords*
// @match        https://twitter.com/settings/add_muted_keyword*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ✅ TR + EN + kulüp/oyuncu listesi
  const words = [
    // Türkçe temel
    "futbol","futbolcu","maç","derbi","gol","hakem","penaltı","ofsayt","saha","stadyum",
    "taraftar","tribün","antrenör","teknik direktör","transfer","lig","süper lig",
    "şampiyonlar ligi","avrupa ligi","dünya kupası","avrupa şampiyonası","kupa",
    "federasyon","tff","millî takım","forma","sakatlık","kart","kırmızı kart","sarı kart",
    "korner","frikik","uzatma","ilk yarı","ikinci yarı","90 dakika",

    // İngilizce temel
    "football","soccer","match","derby","goal","referee","penalty","offside","stadium",
    "fans","supporters","coach","manager","transfer","league","super league",
    "premier league","laliga","serie a","bundesliga","ligue 1",
    "champions league","europa league","world cup","euro","fifa","uefa",
    "national team","injury","yellow card","red card","corner","free kick",
    "extra time","first half","second half","90 minutes",

    // Kulüp/oyuncu popüler
    "galatasaray","fenerbahçe","beşiktaş","trabzonspor","adana demirspor","başakşehir",
    "real madrid","barcelona","manchester","arsenal","chelsea","liverpool","psg","bayern",
    "juventus","inter","milan","ac milan",
    "ronaldo","messi","neymar","mbappe","haaland","salah","benzema","lewandowski"
  ];

  // Global değişkenler
  let isRunning = false;
  let processedCount = 0;

  // ⏱ Bekleme yardımcıları
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const waitForSelector = async (selector, timeout = 8000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) return el; // görünür elemana odaklan
      await sleep(150);
    }
    return null;
  };

  // 💡 React controlled input için güvenli setter
  function setReactInputValue(input, value) {
    try {
      // Input'u temizle
      input.focus();
      input.select();

      // React'in kendi setter'ını kullan
      const prototype = Object.getPrototypeOf(input);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value') ||
                        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(prototype), 'value');

      if (descriptor && descriptor.set) {
        descriptor.set.call(input, value);
      } else {
        input.value = value;
      }

      // React event'lerini tetikle
      ['input', 'change'].forEach(eventType => {
        input.dispatchEvent(new Event(eventType, {
          bubbles: true,
          cancelable: true
        }));
      });

      // Value tracker güncelle
      if (input._valueTracker) {
        input._valueTracker.setValue('');
      }

      return true;
    } catch (error) {
      console.error('❌ Input value set hatası:', error);
      return false;
    }
  }

  // ➕ "kelime ekle" sayfasına gitme
  async function goToAddForm() {
    try {
      const selectors = [
        'a[role="link"][href*="/settings/add_muted_keyword"]',
        'a[href*="/settings/add_muted_keyword"]',
        'a[aria-label*="Sessize alınan kelime"]',
        'a[aria-label*="Add muted"]',
        'a[aria-label*="ekle"]',
        'div[role="button"][aria-label*="ekle"]'
      ];

      let addLink = null;
      for (const selector of selectors) {
        addLink = document.querySelector(selector);
        if (addLink && addLink.offsetParent !== null) break;
      }

      if (addLink) {
        addLink.click();
        // SPA navigation bekle
        for (let i = 0; i < 40; i++) {
          if (location.pathname.includes('/add_muted_keyword')) break;
          await sleep(150);
        }
      } else {
        // Direct navigation
        const baseUrl = location.origin;
        const targetPath = '/settings/add_muted_keyword';

        if (history.pushState) {
          history.pushState({}, '', baseUrl + targetPath);
        } else {
          location.href = baseUrl + targetPath;
        }

        await sleep(1000); // React'in render etmesini bekle
      }

      return location.pathname.includes('/add_muted_keyword');
    } catch (error) {
      console.error('❌ Add form\'a gitme hatası:', error);
      return false;
    }
  }

  // 💾 Kaydet butonunu bul ve tıkla
  async function clickSave() {
    const selectors = [
      'button[data-testid="settingsDetailSave"]',
      'div[role="button"][data-testid="settingsDetailSave"]',
      'button[type="submit"]',
      'div[role="button"]:has-text("Kaydet")',
      'div[role="button"]:has-text("Save")'
    ];

    for (const selector of selectors) {
      const btn = document.querySelector(selector);
      if (btn && btn.offsetParent !== null && !btn.disabled) {
        try {
          btn.removeAttribute('disabled');
          btn.click();
          return true;
        } catch (error) {
          console.error('❌ Buton tıklama hatası:', error);
          continue;
        }
      }
    }

    return false;
  }

  // 📝 Progress gösterme
  function updateProgress(current, total, word) {
    const percentage = Math.round((current / total) * 100);
    console.log(`📊 İlerleme: ${percentage}% (${current}/${total}) - "${word}"`);

    // Sayfa title'ını güncelle
    document.title = `${percentage}% - Kelimeler ekleniyor...`;
  }

  // 🔁 Tek kelime ekleme akışı
  async function addOne(word, index, total) {
    try {
      updateProgress(index + 1, total, word);

      // 1) Add form sayfasına git
      if (!location.pathname.includes('/add_muted_keyword')) {
        const navigated = await goToAddForm();
        if (!navigated) {
          throw new Error('Add form sayfasına gidilemedi');
        }
      }

      // 2) Input'u bul
      const inputSelectors = [
        'input[name="keyword"][type="text"]',
        'input[name="keyword"]',
        'input[type="text"][placeholder*="kelime"]',
        'input[type="text"][placeholder*="word"]'
      ];

      let input = null;
      for (const selector of inputSelectors) {
        input = await waitForSelector(selector, 5000);
        if (input) break;
      }

      if (!input) {
        throw new Error('Input alanı bulunamadı');
      }

      // 3) Kelimeyi yaz
      const inputSet = setReactInputValue(input, word);
      if (!inputSet) {
        throw new Error('Input değeri ayarlanamadı');
      }

      await sleep(500); // UI validation için bekle

      // 4) Kaydet
      const saved = await clickSave();
      if (!saved) {
        throw new Error('Kaydet butonu bulunamadı veya tıklanamadı');
      }

      // 5) İşlem tamamlanmasını bekle
      let waitCount = 0;
      const maxWait = 60; // ~9 saniye

      while (waitCount < maxWait) {
        // Başarılı kayıt sonrası liste sayfasına dönüş kontrolü
        if (location.pathname.includes('/muted_keywords') &&
            !location.pathname.includes('/add_muted_keyword')) {
          break;
        }

        // Ya da yeni ekleme linki görünür hale gelirse
        const addAgain = document.querySelector('a[href*="/add_muted_keyword"]');
        if (addAgain && addAgain.offsetParent !== null) {
          break;
        }

        await sleep(150);
        waitCount++;
      }

      // 6) Sonraki işlem için bekle
      await sleep(Math.random() * 500 + 500); // 500-1000ms arası rastgele
      processedCount++;

      return true;

    } catch (error) {
      console.error(`❌ "${word}" eklenirken hata:`, error.message);
      return false;
    }
  }

  // 🧠 Ana akış
  async function run() {
    if (isRunning) {
      alert('⚠️ Script zaten çalışıyor, lütfen bekleyin...');
      return;
    }

    const confirmed = confirm(
      `⚡ ${words.length} futbol kelimesini toplu sessize almak istiyor musun?\n\n` +
      `Bu işlem yaklaşık ${Math.ceil(words.length * 2 / 60)} dakika sürebilir.`
    );

    if (!confirmed) return;

    isRunning = true;
    processedCount = 0;
    const startTime = Date.now();

    console.log('🚀 Toplu sessize alma başladı...');

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const success = await addOne(word, i, words.length);

      if (!success) {
        console.warn(`⏭️ "${word}" atlandı`);
      }

      // Her 10 kelimede bir ilerleme raporu
      if ((i + 1) % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.ceil(((words.length - i - 1) * elapsed) / (i + 1));
        console.log(`⏱️ ${processedCount}/${i + 1} başarılı, tahmini kalan süre: ${remaining}s`);
      }
    }

    // Tamamlandı
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    document.title = 'X - Muted Keywords'; // Title'ı eski haline getir

    const message = `✅ İşlem tamamlandı!\n\n` +
                   `• Toplam: ${words.length} kelime\n` +
                   `• Başarılı: ${processedCount}\n` +
                   `• Süre: ${totalTime} saniye`;

    alert(message);
    console.log(message);

    isRunning = false;
  }

  // 🔍 Sayfa kontrolü
  function isOnRightPage() {
    return location.pathname.includes('/settings/muted_keywords') ||
           location.pathname.includes('/settings/add_muted_keyword');
  }

  // 🎯 Script başlatma
  function initScript() {
    if (!isOnRightPage()) return;

    if (window.__bulkMutedInitialized) return;
    window.__bulkMutedInitialized = true;

    console.log('🔧 X Bulk Muted Words scripti yüklendi');

    // Sayfa tamamen yüklendikten sonra çalıştır
    setTimeout(() => {
      if (isOnRightPage() && !isRunning) {
        run();
      }
    }, 1500);
  }

  // 📡 İlk yükleme
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScript);
  } else {
    initScript();
  }

  // 🔄 SPA navigation için observer
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldCheck = true;
      }
    });

    if (shouldCheck && isOnRightPage()) {
      // Sayfa değişiminden sonra biraz bekle
      setTimeout(() => {
        if (!window.__bulkMutedInitialized && !isRunning) {
          window.__bulkMutedInitialized = false; // Reset flag
          initScript();
        }
      }, 800);
    } else if (!isOnRightPage()) {
      window.__bulkMutedInitialized = false;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
