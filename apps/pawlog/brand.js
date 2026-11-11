// Brand display only; stable app/store URLs and policy content stay unchanged.
(() => {
  const requested = new URLSearchParams(location.search).get('lang');
  let saved = '';
  try { saved = localStorage.getItem('freedom-tools-home-language') || ''; } catch (_) {}
  const locale = requested || saved || navigator.language || 'en';
  const brand = /^zh/i.test(locale)
    ? (/Hant|TW|HK|MO/i.test(locale) ? '寵物小本' : '宠物小本') : 'PawLog';
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walk.nextNode())) {
    if (!['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)) {
      node.textContent = node.textContent.replaceAll('宠物小本', brand);
    }
  }
  document.querySelectorAll('img[alt]').forEach(img => {
    if (/宠物小本|PawLog/.test(img.alt)) img.alt = brand;
  });
  document.querySelectorAll('meta[content]').forEach(meta => {
    meta.content = meta.content.replaceAll('宠物小本', brand);
  });
  document.title = document.title.replaceAll('宠物小本', brand);
})();
