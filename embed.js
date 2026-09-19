(() => {
  const RING_REF = 'main';
  const RING_BASE = `https://cdn.jsdelivr.net/gh/dejesusbg/paramo-ring@${RING_REF}`;
  const REPO_URL = 'https://github.com/dejesusbg/paramo-ring';
  const SLUG_RE = /^[a-z0-9-]+$/;
  const STYLE_ID = 'paramoring-style';

  const ICON_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.6.8c-.3.2-.6.5-.9.7-.4.3-1,.6-1.5.7-.8.2-2,.2-2.6,1s-.2,1-.5,1.4c-.5.9-1.5,1.2-2.1,2s-.4.8-.4,1.2.2.7.3,1.1c.3,1,.2,1.9.1,2.8s0 .9,0 1.2c0 .5-1 1-1.4 1.3s-1 .9-.6 1.4 1.3 1.1,1.8 1.3.9.2,1.5.3c1.5.2,2.6,1.1,3.6,2.2s.8,1.4,2,1.4,1.7-.2,2.4,0,0 1-.2 1.4c-.3.6.5.6.8.9h.1v-.2c.3-1.2,1.3-3.1.6-4.1s-.6-.6-.4-1.2.9-1.2.4-1.8-.2-.1-.2-.2c0 0 .5-.2.6-.2.7-.1,1.4,0 2.1-.3s.6-.2.7-.3c.1,0 0-.4,0-.5-.4-1.5-1.2-2.8-.5-4.5s.4-.5.2-.6c-.5-.6-1.5.1-2.2,0s-.6-.3-1-.6-.9-.6-1.4-.6-2.1.2-2.1-.9,0-.3,0-.4c0-.3-.3-.7-.4-.9-.8-1.5-.3-2.9,1.1-3.8s.5-.2.8-.4,0-.6-.2-.8h-.7Z"/></svg>';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .paramoring {
        --paramoring-size: 24px;
        --paramoring-color: #000;
        --paramoring-accent: #00000080;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        line-height: 1;
        color: var(--paramoring-color);
      }
      .paramoring a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        text-decoration: none;
      }
      .paramoring a:hover { color: var(--paramoring-accent); }
      .paramoring .paramoring-icon {
        width: var(--paramoring-size);
        height: var(--paramoring-size);
      }
      .paramoring .paramoring-icon svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  function build(el) {
    const slug = el.getAttribute('data-paramoring') || '';

    el.classList.add('paramoring');
    el.innerHTML = `
      <a class="paramoring-prev" href="${REPO_URL}" aria-label="Previous in the ring" target="_top" rel="noopener">&larr;</a>
      <a class="paramoring-icon" href="${REPO_URL}" aria-label="Páramo Ring" target="_top" rel="noopener">${ICON_SVG}</a>
      <a class="paramoring-next" href="${REPO_URL}" aria-label="Next in the ring" target="_top" rel="noopener">&rarr;</a>
    `;

    if (!SLUG_RE.test(slug)) {
      console.warn('[paramo-ring] missing or invalid data-paramoring attribute');
      return;
    }

    fetch(`${RING_BASE}/members.json`)
      .then((res) => res.json())
      .then((members) => {
        const idx = members.findIndex((m) => m.slug === slug);
        if (idx === -1) return;
        const prev = members[(idx - 1 + members.length) % members.length];
        const next = members[(idx + 1) % members.length];
        el.querySelector('.paramoring-prev').href = prev.url;
        el.querySelector('.paramoring-next').href = next.url;
      })
      .catch(() => {
        // leave prev/next pointing at the repo if the manifest can't be fetched
      });
  }

  injectStyle();
  document.querySelectorAll('[data-paramoring]').forEach(build);
})();
