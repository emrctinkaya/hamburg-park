// Replaces the native language select with a custom SVG flag picker so flags render consistently across browsers and iOS.
(() => {
  const select = document.getElementById('lang');
  if (!select || document.getElementById('flagLangPicker')) return;

  const flags = {
    de: `<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#ffce00"/><rect width="3" height="1.333" y="0" fill="#dd0000"/><rect width="3" height=".667" y="0" fill="#000"/></svg>`,
    en: `<svg viewBox="0 0 19 10" aria-hidden="true"><rect width="19" height="10" fill="#fff"/><g fill="#b22234"><rect width="19" height=".77" y="0"/><rect width="19" height=".77" y="1.54"/><rect width="19" height=".77" y="3.08"/><rect width="19" height=".77" y="4.62"/><rect width="19" height=".77" y="6.16"/><rect width="19" height=".77" y="7.70"/><rect width="19" height=".77" y="9.23"/></g><rect width="7.6" height="5.38" fill="#3c3b6e"/><g fill="#fff"><circle cx="1" cy="1" r=".18"/><circle cx="2.2" cy="1" r=".18"/><circle cx="3.4" cy="1" r=".18"/><circle cx="4.6" cy="1" r=".18"/><circle cx="5.8" cy="1" r=".18"/><circle cx="7" cy="1" r=".18"/><circle cx="1.6" cy="2" r=".18"/><circle cx="2.8" cy="2" r=".18"/><circle cx="4" cy="2" r=".18"/><circle cx="5.2" cy="2" r=".18"/><circle cx="6.4" cy="2" r=".18"/><circle cx="1" cy="3" r=".18"/><circle cx="2.2" cy="3" r=".18"/><circle cx="3.4" cy="3" r=".18"/><circle cx="4.6" cy="3" r=".18"/><circle cx="5.8" cy="3" r=".18"/><circle cx="7" cy="3" r=".18"/><circle cx="1.6" cy="4" r=".18"/><circle cx="2.8" cy="4" r=".18"/><circle cx="4" cy="4" r=".18"/><circle cx="5.2" cy="4" r=".18"/><circle cx="6.4" cy="4" r=".18"/></g></svg>`,
    tr: `<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#e30a17"/><circle cx="1.18" cy="1" r=".5" fill="#fff"/><circle cx="1.31" cy="1" r=".4" fill="#e30a17"/><polygon points="1.72,1 2.08,.88 1.86,1.18 1.86,.82 2.08,1.12" fill="#fff"/></svg>`
  };
  const labels = { de: 'Deutsch', en: 'English', tr: 'Türkçe' };

  const style = document.createElement('style');
  style.textContent = `
    #lang{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
    .flag-lang{position:relative;z-index:1500}
    .flag-lang-toggle{width:50px;height:40px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text);display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;padding:7px}
    .flag-lang-toggle svg,.flag-lang-option svg{display:block;width:25px;height:17px;border-radius:3px;box-shadow:0 0 0 1px rgba(15,23,42,.12);flex:none}
    .flag-lang-chevron{font-size:9px;color:var(--muted);line-height:1}
    .flag-lang-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:145px;padding:6px;border:1px solid var(--line);border-radius:14px;background:var(--surface);box-shadow:0 14px 35px rgba(15,23,42,.18);display:none}
    .flag-lang.open .flag-lang-menu{display:block}
    .flag-lang-option{width:100%;border:0;background:transparent;color:var(--text);border-radius:9px;padding:9px 10px;display:flex;align-items:center;gap:9px;text-align:left;cursor:pointer;font-size:12px;font-weight:700}
    .flag-lang-option:hover,.flag-lang-option.active{background:var(--surface2)}
  `;
  document.head.appendChild(style);

  const picker = document.createElement('div');
  picker.id = 'flagLangPicker';
  picker.className = 'flag-lang';
  picker.innerHTML = `
    <button type="button" class="flag-lang-toggle" aria-haspopup="listbox" aria-expanded="false" aria-label="Language">
      <span class="flag-current"></span><span class="flag-lang-chevron">▾</span>
    </button>
    <div class="flag-lang-menu" role="listbox">
      ${['de','en','tr'].map(code => `<button type="button" class="flag-lang-option" data-lang="${code}" role="option">${flags[code]}<span>${labels[code]}</span></button>`).join('')}
    </div>`;
  select.insertAdjacentElement('afterend', picker);

  const toggle = picker.querySelector('.flag-lang-toggle');
  const current = picker.querySelector('.flag-current');
  const options = [...picker.querySelectorAll('.flag-lang-option')];

  const sync = () => {
    const value = select.value || localStorage.getItem('hamburgParkLanguage') || 'de';
    current.innerHTML = flags[value] || flags.de;
    options.forEach(o => {
      const active = o.dataset.lang === value;
      o.classList.toggle('active', active);
      o.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };

  const close = () => {
    picker.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = picker.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  options.forEach(option => option.addEventListener('click', () => {
    select.value = option.dataset.lang;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
    close();
  }));

  document.addEventListener('click', close);
  select.addEventListener('change', sync);
  sync();
})();
