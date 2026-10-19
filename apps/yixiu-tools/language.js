(() => {
  'use strict';
  const content = window.YixiuContent;
  const catalog = window.YixiuCatalog;
  const key = 'freedom-tools-home-language';
  const homeCodes = { 'zh-Hans': 'zh', 'zh-Hant': 'zh-TW' };
  const nativeNames = { 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', en: 'English', ja: '日本語', ko: '한국어', de: 'Deutsch', fr: 'Français', es: 'Español' };
  const select = document.querySelector('#language');
  const page = document.body.dataset.page;
  let language = 'en';
  let query = '';
  let category = 'all';
  function resolve(value) {
    if (!value) return null;
    if (value === 'zh') return 'zh-Hans';
    if (/^zh/i.test(value)) return /Hant|TW|HK|MO/i.test(value) ? 'zh-Hant' : 'zh-Hans';
    const code = value.split('-')[0].toLowerCase();
    return content[code] ? code : null;
  }
  function savedLanguage() {
    try { return resolve(localStorage.getItem(key)); } catch { return null; }
  }
  function textElement(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function renderSections(target, sections, disclosures = false) {
    const parent = document.querySelector(target);
    if (!parent) return;
    parent.replaceChildren();
    sections.forEach(([title, body]) => {
      const wrapper = document.createElement(disclosures ? 'details' : 'section');
      wrapper.append(textElement(disclosures ? 'summary' : 'h2', title), textElement('p', body));
      parent.append(wrapper);
    });
  }
  function renderTools() {
    if (!catalog || page !== 'overview') return;
    const copy = content[language];
    const parent = document.querySelector('#tool-catalog');
    const normalized = query.trim().toLocaleLowerCase(language);
    parent.replaceChildren();
    let count = 0;
    catalog.categories.forEach(group => {
      if (category !== 'all' && category !== group.id) return;
      const tools = group.tools.filter(tool => tool.text[language].some(text => text.toLocaleLowerCase(language).includes(normalized)));
      if (!tools.length) return;
      count += tools.length;
      const section = document.createElement('details');
      section.className = 'tool-category';
      section.open = Boolean(normalized) || category !== 'all' || group.id === 'image';
      const summary = document.createElement('summary');
      summary.append(textElement('span', group.title[language]), textElement('span', new Intl.NumberFormat(language).format(tools.length), 'category-count'));
      const list = document.createElement('ul');
      list.className = 'tool-list';
      tools.forEach(tool => {
        const item = document.createElement('li');
        item.append(textElement('h3', tool.text[language][0]), textElement('p', tool.text[language][1]));
        list.append(item);
      });
      section.append(summary, list);
      parent.append(section);
    });
    document.querySelector('#result-count').textContent = copy.results.replace('%n', new Intl.NumberFormat(language).format(count));
    if (!count) parent.append(textElement('p', copy.empty, 'empty-state'));
  }
  function applyLanguage(code) {
    language = content[code] ? code : 'en';
    const copy = content[language];
    document.documentElement.lang = language;
    document.title = copy.name + ' · ' + copy[page];
    document.querySelector('meta[name="description"]').content = page === 'overview' ? copy.summary : copy[page + 'Intro'];
    document.querySelectorAll('[data-text]').forEach(node => { node.textContent = copy[node.dataset.text]; });
    document.querySelector('nav').setAttribute('aria-label', copy[page]);
    document.querySelector('label[for="language"]').textContent = copy.language;
    select.value = language;
    document.querySelector('.icon').alt = copy.name;
    document.querySelector('#page-title').textContent = copy.name + ' · ' + copy[page];
    document.querySelector('footer').textContent = '© 2026 ' + copy.name;
    document.querySelectorAll('nav a[data-page-link]').forEach(link => {
      const target = link.dataset.pageLink;
      link.href = (target === 'overview' ? './' : target + '.html') + '?lang=' + language;
    });
    if (page === 'overview') {
      document.querySelector('#tool-count').textContent = copy.count.replace('%t', catalog.toolCount).replace('%c', catalog.categoryCount);
      const highlights = document.querySelector('#highlights');
      highlights.replaceChildren();
      for (let i = 0; i < copy.highlights.length; i += 2) {
        const section = document.createElement('section');
        section.append(textElement('h2', copy.highlights[i]), textElement('p', copy.highlights[i + 1]));
        highlights.append(section);
      }
      const input = document.querySelector('#tool-search');
      input.placeholder = copy.search;
      input.setAttribute('aria-label', copy.search);
      const filter = document.querySelector('#category-filter');
      filter.setAttribute('aria-label', copy.all);
      filter.replaceChildren(new Option(copy.all, 'all'), ...catalog.categories.map(group => new Option(group.title[language], group.id)));
      filter.value = category;
      renderTools();
    } else if (page === 'privacy') {
      renderSections('#privacy-sections', copy.privacySections);
    } else if (page === 'support') {
      const email = document.querySelector('#feedback-email');
      email.href = 'mailto:somerking@foxmail.com?subject=' + encodeURIComponent(copy.name + ' · ' + copy.support);
      renderSections('#questions', copy.questions, true);
    }
    try { localStorage.setItem(key, homeCodes[language] || language); } catch { /* Browsing remains available without storage. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }
  Object.entries(nativeNames).forEach(([code, name]) => select.add(new Option(name, code)));
  select.addEventListener('change', () => applyLanguage(select.value));
  document.querySelector('#tool-search')?.addEventListener('input', event => { query = event.target.value; renderTools(); });
  document.querySelector('#category-filter')?.addEventListener('change', event => { category = event.target.value; renderTools(); });
  const requested = resolve(new URLSearchParams(location.search).get('lang'));
  const system = (navigator.languages || [navigator.language]).map(resolve).find(Boolean);
  applyLanguage(requested || savedLanguage() || system || 'en');
})();
