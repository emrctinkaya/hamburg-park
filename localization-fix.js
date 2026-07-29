// Extends Hamburg Park API-value localization with compound resident-parking rules.
(() => {
  const base = window.localizeApiValue;
  if (typeof base !== 'function') return;

  const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ');
  const getLanguage = () => {
    const selectValue = document.getElementById('lang')?.value;
    if (selectValue === 'de' || selectValue === 'en' || selectValue === 'tr') return selectValue;
    const stored = localStorage.getItem('hamburgParkLanguage');
    return stored === 'en' || stored === 'tr' ? stored : 'de';
  };

  const exact = {
    en: {
      'Parkschein, Bewohner mit Ausweis frei': 'Parking ticket required; residents with permit exempt',
      'Parkschein, Bewohner mit Parkausweis frei': 'Parking ticket required; residents with permit exempt',
      'Bewohner mit Ausweis frei': 'Residents with permit exempt',
      'Bewohner mit Parkausweis frei': 'Residents with permit exempt',
      'Bewohner frei': 'Residents with permit exempt',
      'Parkschein': 'Parking ticket required'
    },
    tr: {
      'Parkschein, Bewohner mit Ausweis frei': 'Park bileti gerekli; izinli bölge sakinleri muaf',
      'Parkschein, Bewohner mit Parkausweis frei': 'Park bileti gerekli; izinli bölge sakinleri muaf',
      'Bewohner mit Ausweis frei': 'İzinli bölge sakinleri muaf',
      'Bewohner mit Parkausweis frei': 'İzinli bölge sakinleri muaf',
      'Bewohner frei': 'İzinli bölge sakinleri muaf',
      'Parkschein': 'Park bileti gerekli'
    }
  };

  const rules = {
    en: [
      [/Parkschein\s*,\s*Bewohner(?:\s+mit\s+(?:Park)?Ausweis)?\s+frei/gi, 'Parking ticket required; residents with permit exempt'],
      [/Bewohner\s+mit\s+(?:Park)?Ausweis\s+frei/gi, 'Residents with permit exempt'],
      [/Bewohner\s+frei/gi, 'Residents with permit exempt'],
      [/mit\s+Parkschein/gi, 'Parking ticket required'],
      [/Parkschein/gi, 'Parking ticket required']
    ],
    tr: [
      [/Parkschein\s*,\s*Bewohner(?:\s+mit\s+(?:Park)?Ausweis)?\s+frei/gi, 'Park bileti gerekli; izinli bölge sakinleri muaf'],
      [/Bewohner\s+mit\s+(?:Park)?Ausweis\s+frei/gi, 'İzinli bölge sakinleri muaf'],
      [/Bewohner\s+frei/gi, 'İzinli bölge sakinleri muaf'],
      [/mit\s+Parkschein/gi, 'Park bileti gerekli'],
      [/Parkschein/gi, 'Park bileti gerekli']
    ]
  };

  window.localizeApiValue = function(field, value) {
    if (value == null || value === '') return base(field, value);

    const language = getLanguage();
    if (language === 'de') return base(field, value);

    let raw = normalize(value);
    const exactMatch = exact[language]?.[raw];
    if (exactMatch) return exactMatch;

    if (field !== 'bewirtschaftungszeit' && rules[language]) {
      for (const [pattern, replacement] of rules[language]) raw = raw.replace(pattern, replacement);
      if (!/[äöüß]|\b(Bewohner|Parkschein|Ausweis|frei)\b/i.test(raw)) return raw;
    }

    return base(field, raw);
  };

  // The main application may already have rendered the result before this patch is loaded.
  // Re-apply the currently selected language so resultHtml()/sheet content is rebuilt
  // using the patched localization function.
  const rerender = () => {
    const select = document.getElementById('lang');
    if (!select) return;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(rerender, 0), { once: true });
  } else {
    setTimeout(rerender, 0);
  }
})();