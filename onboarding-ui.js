// Adaptive onboarding UI: keep the large location card only until location is available.
(() => {
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.header');
  const result = document.getElementById('result');
  const status = document.getElementById('status');
  const live = document.getElementById('live');
  if (!hero || !header || !result) return;

  const compact = document.createElement('div');
  compact.id = 'compactLocationStatus';
  compact.setAttribute('aria-live', 'polite');
  compact.style.cssText = 'display:none;align-items:center;gap:7px;margin:-5px 0 10px;padding:0 2px;font-size:11px;font-weight:800;color:var(--success)';
  compact.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px rgba(6,118,71,.11)"></span><span id="compactLocationText"></span>';
  header.insertAdjacentElement('afterend', compact);

  const compactText = compact.querySelector('#compactLocationText');

  function liveLabel() {
    const source = document.getElementById('liveText');
    return source?.textContent || ({de:'Live-Standort aktiv',en:'Live location active',tr:'Canlı konum aktif'}[window.lang] || 'Live-Standort aktiv');
  }

  function hasLocationResult() {
    return Boolean(result.querySelector('.result-card'));
  }

  function setOnboarded(onboarded) {
    hero.classList.toggle('hidden', onboarded);
    compact.style.display = onboarded ? 'flex' : 'none';
    if (onboarded) compactText.textContent = liveLabel();
  }

  function sync() {
    // A rendered zone result is the strongest signal. The saved flag keeps the
    // onboarding card out of the way while live location is being restored.
    const onboarded = hasLocationResult() || localStorage.getItem('hamburgParkLocationApproved') === '1';
    setOnboarded(onboarded);
  }

  new MutationObserver(() => {
    if (hasLocationResult()) setOnboarded(true);
  }).observe(result, {childList:true, subtree:true});

  if (status) new MutationObserver(() => {
    // When location permission is denied, the core app removes the saved flag.
    if (localStorage.getItem('hamburgParkLocationApproved') !== '1' && status.classList.contains('error')) setOnboarded(false);
  }).observe(status, {childList:true, attributes:true, attributeFilter:['class']});

  if (live) new MutationObserver(() => {
    compactText.textContent = liveLabel();
  }).observe(live, {childList:true, subtree:true, attributes:true});

  const lang = document.getElementById('lang');
  if (lang) lang.addEventListener('change', () => setTimeout(() => { compactText.textContent = liveLabel(); }, 0));

  sync();
})();