(() => {
  const RING_REF = 'main';
  const RING_BASE = `https://cdn.jsdelivr.net/gh/dejesusbg/paramo-ring@${RING_REF}`;
  const REPO_URL = 'https://github.com/dejesusbg/paramo-ring';
  const SLUG_RE = /^[a-z0-9-]+$/;
  const STYLE_ID = 'paramoring-style';
  const LABEL = '🏔️';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .paramoring {
        display: inline-flex;
      }
      .paramoring-btn {
        --paramoring-size: 48px;
        width: var(--paramoring-size);
        height: var(--paramoring-size);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: none;
        font-size: var(--paramoring-size);
        line-height: 1;
        cursor: pointer;
        filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.15));
        transition: transform 100ms ease, opacity 100ms ease;
      }
      .paramoring-btn:hover {
        opacity: 0.8;
      }
      .paramoring-btn:active {
        opacity: 0.8;
        transform: scale(0.92);
      }
    `;
    document.head.appendChild(style);
  }

  function build(el) {
    const slug = el.getAttribute('data-paramoring') || '';

    el.classList.add('paramoring');
    el.innerHTML = `<button type="button" class="paramoring-btn" aria-label="Visit a random site in the paramo ring">${LABEL}</button>`;

    if (!SLUG_RE.test(slug)) {
      console.warn('[paramo-ring] missing or invalid data-paramoring attribute');
      return;
    }

    const btn = el.querySelector('.paramoring-btn');

    btn.addEventListener('click', () => {
      btn.disabled = true;
      fetch(`${RING_BASE}/members.json`)
        .then((res) => res.json())
        .then((members) => {
          const others = members.filter((m) => m.slug !== slug);
          const pool = others.length ? others : members;
          const pick = pool[Math.floor(Math.random() * pool.length)];
          window.open(pick ? pick.url : REPO_URL, '_blank', 'noopener');
        })
        .catch(() => {
          window.open(REPO_URL, '_blank', 'noopener');
        })
        .finally(() => {
          btn.disabled = false;
        });
    });
  }

  injectStyle();
  document.querySelectorAll('[data-paramoring]').forEach(build);
})();
