// Extends Hamburg Park API-value localization with compound resident-parking rules.
(() => {
  const base = window.localizeApiValue;
  if (typeof base !== 'function') return;

  const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ');
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
    if (value == null || value === '' || window.lang === 'de') return base(field, value);
    let raw = normalize(value);
    const language = window.lang;
    if (field !== 'bewirtschaftungszeit' && rules[language]) {
      for (const [pattern, replacement] of rules[language]) raw = raw.replace(pattern, replacement);
      // If a compound parking-rule phrase was fully localized, return it directly.
      if (language === 'en' && !/[äöüß]|\b(Bewohner|Parkschein|Ausweis|frei)\b/i.test(raw)) return raw;
      if (language === 'tr' && !/[äöüß]|\b(Bewohner|Parkschein|Ausweis|frei)\b/i.test(raw)) return raw;
    }
    return base(field, raw);
  };
})();