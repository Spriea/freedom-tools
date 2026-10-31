(() => {
  const key = 'trackalong-site-language';
  function supported(value) {
    if (value === 'zh' || /^zh-(hans|cn|sg)(-|$)/i.test(value)) return 'zh';
    if (/^en(-|$)/i.test(value)) return 'en';
    return null;
  }
  let saved; try { saved = localStorage.getItem(key); } catch (_) {}
  const initial = supported(saved || '') || (navigator.languages || [navigator.language]).map(supported).find(Boolean) || 'en';
  window.setLang = function(lang) {
    lang = supported(lang) || 'en';
    document.querySelectorAll('[data-lang]').forEach(el => { el.hidden = el.dataset.lang !== lang; el.style.display = el.hidden ? 'none' : ''; });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = document.body.dataset[lang + 'Title'];
    const select = document.querySelector('#language'); if (select) select.value = lang;
    ['Zh', 'En'].forEach(name => document.querySelector('#btn' + name)?.classList.toggle('active', lang === name.toLowerCase()));
    try { localStorage.setItem(key, lang); } catch (_) {}
  };
  document.querySelector('#language')?.addEventListener('change', event => setLang(event.target.value));
  setLang(initial);
})();
