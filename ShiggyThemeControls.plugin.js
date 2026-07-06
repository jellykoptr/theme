/**
 * @name ShiggyThemeControls
 * @version 1.0.0
 * @description Ajoute deux curseurs pour régler l'opacité (alpha) et le flou (blur) de l'overlay de thème. Sauvegarde dans localStorage.
 * @author jellykoptr
 */
/* eslint-disable */
(function () {
  const STORAGE_KEY = 'shiggy_theme_controls_v1';
  const DEFAULTS = { alpha: 0.10, blur: 0.5 };

  let state;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    state = { alpha: (saved.alpha ?? DEFAULTS.alpha), blur: (saved.blur ?? DEFAULTS.blur) };
  } catch (e) {
    state = { ...DEFAULTS };
  }

  // CSS variables + overlay selectors (adapte si nécessaire)
  const CSS_ID = 'shiggy-theme-controls-styles';
  function getStyleContent() {
    return `
:root { --overlay-alpha: ${state.alpha}; --overlay-blur: ${state.blur}px; }

/* Sélecteurs d'overlay courants — adapte si ton thème utilise un autre sélecteur */
.theme-overlay, .da-background-overlay, .background-2lrs0e, .bg-3J7uX5, .user-profile__banner-background {
  backdrop-filter: blur(var(--overlay-blur)) !important;
  -webkit-backdrop-filter: blur(var(--overlay-blur)) !important;
  background-color: rgba(0,0,0,var(--overlay-alpha)) !important;
}
`;
  }

  function injectStyle() {
    let el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = getStyleContent();
    document.documentElement.style.setProperty('--overlay-alpha', String(state.alpha));
    document.documentElement.style.setProperty('--overlay-blur', state.blur + 'px');
  }

  // UI: floating button + panel
  const BTN_ID = 'shiggy-theme-controls-btn';
  const PANEL_ID = 'shiggy-theme-controls-panel';
  const UI_STYLE_ID = 'shiggy-theme-controls-ui-style';

  function injectUIStyles() {
    if (document.getElementById(UI_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = UI_STYLE_ID;
    s.textContent = `
#${BTN_ID}{
  position:fixed; left:12px; bottom:88px; z-index:9999999;
  background:#5865F2; color:#fff; border-radius:6px; padding:6px 8px;
  cursor:pointer; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.25); border:none;
  font-family:Segoe UI, Roboto, sans-serif;
}
#${PANEL_ID}{
  position:fixed; left:12px; bottom:140px; z-index:9999999;
  background:rgba(32,34,37,0.98); color:#fff; padding:12px; border-radius:8px;
  width:280px; box-shadow:0 8px 30px rgba(0,0,0,0.6); font-family:Segoe UI, Roboto, sans-serif;
}
#${PANEL_ID} label{display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-bottom:6px;}
#${PANEL_ID} input[type=range]{width:100%;}
#${PANEL_ID} .row{margin-bottom:8px;}
#${PANEL_ID} button{background:#99aab5;color:#000;border:none;padding:6px 8px;border-radius:5px;cursor:pointer;}
`;
    document.head.appendChild(s);
  }

  function createUI() {
    if (document.getElementById(BTN_ID)) return;

    injectUIStyles();

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.textContent = 'Thème';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.display = 'none';
    panel.innerHTML = `
<div class="row"><label>Opacité <span id="shiggy-alpha-val">${state.alpha.toFixed(2)}</span></label>
<input type="range" id="shiggy-alpha-range" min="0" max="1" step="0.01" value="${state.alpha}">
</div>
<div class="row"><label>Flou <span id="shiggy-blur-val">${state.blur}px</span></label>
<input type="range" id="shiggy-blur-range" min="0" max="30" step="1" value="${state.blur}">
</div>
<div style="display:flex;gap:8px;justify-content:flex-end;">
<button id="shiggy-reset">Réinitialiser</button>
<button id="shiggy-close">Fermer</button>
</div>
`;
    document.body.appendChild(panel);

    btn.addEventListener('click', () => {
      panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
    });
    panel.querySelector('#shiggy-close').addEventListener('click', () => panel.style.display = 'none');
    panel.querySelector('#shiggy-reset').addEventListener('click', () => {
      state.alpha = DEFAULTS.alpha; state.blur = DEFAULTS.blur;
      updateUI();
      save();
      apply();
    });

    const alphaRange = panel.querySelector('#shiggy-alpha-range');
    const blurRange = panel.querySelector('#shiggy-blur-range');
    const alphaVal = panel.querySelector('#shiggy-alpha-val');
    const blurVal = panel.querySelector('#shiggy-blur-val');

    alphaRange.addEventListener('input', e => {
      state.alpha = parseFloat(e.target.value);
      alphaVal.textContent = state.alpha.toFixed(2);
      save();
      apply();
    });

    blurRange.addEventListener('input', e => {
      state.blur = parseInt(e.target.value, 10);
      blurVal.textContent = state.blur + 'px';
      save();
      apply();
    });

    function updateUI() {
      alphaRange.value = state.alpha;
      blurRange.value = state.blur;
      alphaVal.textContent = state.alpha.toFixed(2);
      blurVal.textContent = state.blur + 'px';
    }
    updateUI();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ alpha: state.alpha, blur: state.blur }));
  }

  function apply() {
    document.documentElement.style.setProperty('--overlay-alpha', String(state.alpha));
    document.documentElement.style.setProperty('--overlay-blur', state.blur + 'px');
    const el = document.getElementById(CSS_ID);
    if (el) el.textContent = getStyleContent();
  }

  const mo = new MutationObserver(() => apply());
  const MO_TARGET = document.documentElement;

  function start() {
    injectStyle();
    createUI();
    apply();
    mo.observe(MO_TARGET, { childList: true, subtree: true });
  }

  function stop() {
    mo.disconnect();
    const s = document.getElementById(CSS_ID); if (s) s.remove();
    const u = document.getElementById(UI_STYLE_ID); if (u) u.remove();
    const b = document.getElementById(BTN_ID); if (b) b.remove();
    const p = document.getElementById(PANEL_ID); if (p) p.remove();
    document.documentElement.style.removeProperty('--overlay-alpha');
    document.documentElement.style.removeProperty('--overlay-blur');
  }

  // Auto-start unless the environment expects explicit start
  try {
    // For plugin hosts that expect class with start/stop, expose them
    const plugin = { start, stop };
    // If running as a plain userscript, auto start
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = plugin;
    } else {
      // Auto init
      start();
      // expose for console debugging
      window.ShiggyThemeControls = plugin;
    }
  } catch (e) {
    console.error('ShiggyThemeControls init error', e);
  }
})();
