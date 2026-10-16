import ReactDOM from 'react-dom/client';
import { extractProfileId } from '@/lib/utils';
import { getNote } from '@/lib/storage';
import { NotesOverlay } from './components/NotesOverlay';
import { createBadge, createFloatingBadge, updateBadge } from './badge';

// LinkedIn uses obfuscated class names that change frequently.
// Use stable selectors: tag names, ARIA roles, and structural patterns.
function findProfileName(): HTMLElement | null {
  // LinkedIn moved the profile name from <h1> to the first heading inside <main>.
  return document.querySelector('main h1, main h2');
}

// Name from sources that don't depend on LinkedIn's markup: the tab <title>
// ("Name | LinkedIn") and the og:title meta tag. Used when the DOM heading
// can't be found, so the feature still works after any layout change.
function getDocumentName(): string {
  const title = document.title
    .replace(/^\(\d+\)\s*/, '')
    .replace(/\s*\|.*$/, '')
    .trim();
  if (title && title.toLowerCase() !== 'linkedin') return title;
  const og =
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
      ?.content ?? '';
  return og.replace(/\s*\|.*$/, '').trim();
}

function findProfileHeadline(): string {
  // Headline is the first substantive <p> in the name's top-card section,
  // skipping the short "· Nth" connection-degree line.
  const section = findProfileName()?.closest('section');
  for (const p of section?.querySelectorAll('p') ?? []) {
    const t = p.textContent?.trim() ?? '';
    if (t.length >= 15 && !t.startsWith('·')) return t;
  }
  return '';
}

function findProfileImage(): string | undefined {
  // Profile photo is a ~100-260px LinkedIn media image in the top-card section.
  const section =
    findProfileName()?.closest('section') ?? document.querySelector('main');
  for (const img of section?.querySelectorAll<HTMLImageElement>(
    'img[src*="licdn.com"]'
  ) ?? []) {
    const w = img.getBoundingClientRect().width;
    if (w >= 100 && w <= 260) return img.src;
  }
  return undefined;
}

export default defineContentScript({
  matches: ['*://*.linkedin.com/in/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    let currentProfileId: string | null = null;
    let overlayRoot: ReactDOM.Root | null = null;
    let badge: HTMLElement | null = null;
    let injecting = false;

    function getProfileInfo() {
      const profileId = extractProfileId(window.location.href);
      if (!profileId) return null;

      // Name resolution degrades gracefully: DOM heading → tab title/meta → slug.
      const domName = findProfileName()?.innerText?.trim();
      return {
        profileId,
        profileName: domName || getDocumentName() || profileId,
        headline: findProfileHeadline(),
        profileUrl: window.location.href.split('?')[0],
        profileImageUrl: findProfileImage(),
      };
    }

    async function injectBadge() {
      // `injecting` guards against the re-inject interval firing again while the
      // async getNote() below is still in flight (which would double-add badges).
      if (injecting || badge?.isConnected) return;
      injecting = true;
      try {
        const profileId = extractProfileId(window.location.href);
        if (!profileId) return;

        const existing = await getNote(profileId);
        const nameEl = findProfileName();
        const nameParent = nameEl?.parentElement;

        if (nameParent) {
          // Preferred: contextual badge next to the profile name.
          badge = createBadge(!!existing, () => openOverlay());
          nameParent.style.display = 'inline-flex';
          nameParent.style.alignItems = 'center';
          nameParent.appendChild(badge);
        } else {
          // Fallback: self-positioned floating button that depends on nothing in
          // LinkedIn's DOM, so the feature can never fully disappear.
          badge = createFloatingBadge(!!existing, () => openOverlay());
          document.body.appendChild(badge);
        }
      } finally {
        injecting = false;
      }
    }

    function openOverlay() {
      const info = getProfileInfo();
      if (!info) return;

      // Prevent duplicate overlays
      if (document.getElementById('linkedin-notes-overlay-root')) return;

      const container = document.createElement('div');
      container.id = 'linkedin-notes-overlay-root';
      document.body.appendChild(container);

      overlayRoot = ReactDOM.createRoot(container);
      overlayRoot.render(
        <NotesOverlay
          profileId={info.profileId}
          profileName={info.profileName}
          headline={info.headline}
          profileUrl={info.profileUrl}
          profileImageUrl={info.profileImageUrl}
          onClose={() => {
            closeOverlay();
          }}
          onSaved={(hasNotes) => {
            if (badge) updateBadge(badge, hasNotes);
          }}
        />
      );
    }

    function closeOverlay() {
      if (overlayRoot) {
        overlayRoot.unmount();
        overlayRoot = null;
      }
      const container = document.getElementById('linkedin-notes-overlay-root');
      container?.remove();
    }

    function cleanup() {
      closeOverlay();
      badge?.remove();
      badge = null;
      currentProfileId = null;
    }

    async function handleNavigation() {
      const profileId = extractProfileId(window.location.href);
      if (profileId === currentProfileId) return;

      cleanup();
      currentProfileId = profileId;

      if (!profileId) return;

      // Wait for the name to render (best-effort). If it never shows, injectBadge
      // falls back to the floating button, so we inject either way.
      let attempts = 0;
      while (!findProfileName() && attempts < 20) {
        await new Promise((r) => setTimeout(r, 250));
        attempts++;
      }

      // Bail if the user navigated to a different profile while we waited.
      if (extractProfileId(window.location.href) !== profileId) return;

      await injectBadge();
    }

    // Initial load
    await handleNavigation();

    // LinkedIn is a SPA that swaps the page (URL change) and re-renders the top
    // card in place (which wipes our injected badge). Handle both: navigate on
    // URL change, otherwise re-inject the badge whenever it's been removed.
    ctx.setInterval(() => {
      const profileId = extractProfileId(window.location.href);
      if (profileId !== currentProfileId) {
        handleNavigation();
      } else if (profileId && !badge?.isConnected) {
        injectBadge();
      }
    }, 500);

    // A MutationObserver makes re-injection near-instant (no visible flicker)
    // when LinkedIn re-renders, instead of waiting up to 500ms for the interval.
    const observer = new MutationObserver(() => {
      if (currentProfileId && !badge?.isConnected && !injecting) injectBadge();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});
