(()=>{
const css=`
.permit.permit-compact{padding:12px 14px}.permit.permit-compact .copy,.permit.permit-compact .permit-row,.permit.permit-compact .saved{display:none!important}.permit-summary{display:none;align-items:center;justify-content:space-between;gap:12px}.permit.permit-compact .permit-summary{display:flex}.permit-summary-main{min-width:0}.permit-summary-label{font-size:10px;color:var(--muted);font-weight:750}.permit-summary-code{font-size:18px;font-weight:900;margin-top:2px}.permit-change{border:0;border-radius:11px;padding:9px 12px;background:var(--surface2);color:var(--text);font-size:11px;font-weight:850;cursor:pointer}.accuracy.accuracy-poor{color:var(--warning);background:var(--warningBg);box-shadow:inset 0 0 0 1px #fed7aa}.accuracy-note{margin-top:8px;color:var(--warning);font-size:10px;font-weight:700}.live{color:var(--muted)!important}.live-dot{background:var(--muted)!important;box-shadow:0 0 0 4px color-mix(in srgb,var(--muted) 12%,transparent)!important}
@media(max-width:520px){.compact-details{grid-template-columns:1fr}.detail-chip-value{font-size:12px;line-height:1.35}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
const permit=document.querySelector('.permit'),input=document.getElementById('permitInput');if(!permit||!input)return;
const summary=document.createElement('div');summary.className='permit-summary';summary.innerHTML='<div class="permit-summary-main"><div class="permit-summary-label"></div><div class="permit-summary-code"></div></div><button type="button" class="permit-change"></button>';permit.insertBefore(summary,permit.firstChild);
const label=summary.querySelector('.permit-summary-label'),code=summary.querySelector('.permit-summary-code'),change=summary.querySelector('.permit-change');
const texts={de:{label:'Mein Parkausweis',change:'Ändern',poor:'Standortgenauigkeit ist niedrig'},en:{label:'My parking permit',change:'Change',poor:'Location accuracy is low'},tr:{label:'Park iznim',change:'Değiştir',poor:'Konum doğruluğu düşük'}};
const currentLang=()=>localStorage.getItem('hamburgParkLanguage')||document.getElementById('lang')?.value||'de';
let editing=false;
function savedCode(){return (localStorage.getItem('hamburgParkPermit')||'').trim().toUpperCase()}
function updatePermit(){const l=currentLang(),c=savedCode();label.textContent=(texts[l]||texts.de).label;change.textContent=(texts[l]||texts.de).change;code.textContent=c;if(c&&!editing)permit.classList.add('permit-compact');else permit.classList.remove('permit-compact')}
change.addEventListener('click',()=>{editing=true;permit.classList.remove('permit-compact');input.value=savedCode();setTimeout(()=>{input.focus();input.select()},0)});
document.getElementById('save')?.addEventListener('click',()=>setTimeout(()=>{if(savedCode()){editing=false;updatePermit()}},0));
document.getElementById('lang')?.addEventListener('change',()=>setTimeout(()=>{updatePermit();updateAccuracy()},0));
function updateAccuracy(){const badge=document.querySelector('.accuracy');if(!badge)return;const m=(badge.textContent||'').match(/±\s*(\d+)/);const acc=m?Number(m[1]):0;badge.classList.toggle('accuracy-poor',acc>=30);let note=badge.closest('.result-card')?.querySelector('.accuracy-note');if(acc>=30){if(!note){note=document.createElement('div');note.className='accuracy-note';const top=badge.closest('.result-card')?.querySelector('.result-top');top?.insertAdjacentElement('afterend',note)}note.textContent=`${(texts[currentLang()]||texts.de).poor} (±${acc} m)`}else note?.remove()}
function simplifyZoneName(){document.querySelectorAll('.zone-name').forEach(el=>{const zone=el.closest('.result-card')?.querySelector('.zone')?.textContent?.replace(/\s+/g,'').trim();if(!zone)return;const re=new RegExp('^'+zone.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*','i');el.textContent=el.textContent.replace(re,'').trim()||el.textContent})}
const obs=new MutationObserver(()=>{updatePermit();updateAccuracy();simplifyZoneName()});obs.observe(document.getElementById('result')||document.body,{childList:true,subtree:true});
updatePermit();updateAccuracy();simplifyZoneName();
})();
