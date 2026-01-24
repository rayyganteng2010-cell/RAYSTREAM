/*
  protect.js (deterrent, NOT security)
  - Ini cuma bikin “ganggu” orang yang iseng.
  - Siapa pun yang ngerti sedikit bisa bypass. Karena semua yang dikirim ke browser pasti bisa diambil.
*/
(function () {
  'use strict';

  // 1) Blokir klik kanan (deterrent)
  window.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

  // 2) Blokir beberapa shortcut umum DevTools (deterrent)
  window.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+P
    if (
      (ctrl && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
      (ctrl && (key === 'u' || key === 's' || key === 'p'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3) Deteksi DevTools via perbedaan ukuran window (deterrent)
  //    Kalau kebuka, kita "freeze" UI (opsional). Bisa dimatiin kalau ganggu user.
  const THRESHOLD = 160;
  function devtoolsOpen() {
    const wDiff = Math.abs(window.outerWidth - window.innerWidth);
    const hDiff = Math.abs(window.outerHeight - window.innerHeight);
    return wDiff > THRESHOLD || hDiff > THRESHOLD;
  }

  let tripped = false;
  function trip() {
    if (tripped) return;
    tripped = true;

    // Mode "annoy" tanpa ngerusak app: blur + overlay
    const overlay = document.createElement('div');
    overlay.id = 'rs-protect-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'background:rgba(0,0,0,.92)',
      'color:#fff',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'text-align:center',
      'padding:24px',
      'font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      'line-height:1.4'
    ].join(';');

    overlay.innerHTML = `
      <div style="max-width:560px;">
        <div style="font-size:18px;font-weight:700;margin-bottom:10px;">DevTools terdeteksi</div>
        <div style="opacity:.85;">
          Kalau niatnya cuma nonton, tutup DevTools. Kalau niatnya ngulik source, ya... browser itu milik kamu.
          Tapi jangan kaget kalau rate limit / block jalan.
        </div>
      </div>
    `;

    document.documentElement.style.filter = 'blur(2px)';
    document.body.appendChild(overlay);

    // Optional: ping API/log endpoint kalau kamu punya (biar bisa ban IP). Di sini dimatiin.
    // fetch('/api/log-devtools', { method: 'POST' }).catch(()=>{});
  }

  // Check berkala
  setInterval(() => {
    try {
      if (devtoolsOpen()) trip();
    } catch (_) {}
  }, 700);
})();
