import ReactDOM from 'react-dom/client';
import { extractProfileId } from '@/lib/utils';
import { getNote } from '@/lib/storage';
import { NotesOverlay } from './components/NotesOverlay';
import { createBadge, updateBadge } from './badge';

// LinkedIn uses obfuscated class names that change frequently.
// Use stable selectors: tag names, ARIA roles, and structural patterns.
function findProfileName(): HTMLElement | null {
  // The profile name is always the first h1 on a profile page
  return document.querySelector('h1');
}

function findProfileHeadline(): string {
  // Headline is in a .text-body-medium element near the top of the profile
  const el = document.querySelector('.text-body-medium');
  return el?.textContent?.trim() ?? '';
}

function findProfileImage(): string | undefined {
  // Profile photo has class containing 'profile-photo-edit__preview' (own profile)
  // or 'pv-top-card-profile-picture__image' (other profiles)
  const img =
    document.querySelector<HTMLImageElement>('img.profile-photo-edit__preview') ??
    document.querySelector<HTMLImageElement>('img[class*="pv-top-card-profile-picture"]') ??
    document.querySelector<HTMLImageElement>('main img.evi-image[width="152"]') ??
    document.querySelector<HTMLImageElement>('main img.evi-image[alt][width="128"]');
  return img?.src;
}

export default defineContentScript({
  matches: ['*://*.linkedin.com/in/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    let currentProfileId: string | null = null;
    let overlayRoot: ReactDOM.Root | null = null;
    let badge: HTMLElement | null = null;

    function getProfileInfo() {
      const profileId = extractProfileId(window.location.href);
      if (!profileId) return null;

      const nameEl = findProfileName();
      return {
        profileId,
        profileName: nameEl?.innerText?.trim() ?? profileId,
        headline: findProfileHeadline(),
        profileUrl: window.location.href.split('?')[0],
        profileImageUrl: findProfileImage(),
      };
    }

    async function injectBadge() {
      const nameEl = findProfileName();
      if (!nameEl || badge?.isConnected) return;

      const profileId = extractProfileId(window.location.href);
      if (!profileId) return;

      const existing = await getNote(profileId);
      badge = createBadge(!!existing, () => openOverlay());

      // Insert badge after the h1, within its parent
      const nameParent = nameEl.parentElement;
      if (nameParent) {
        nameParent.style.display = 'inline-flex';
        nameParent.style.alignItems = 'center';
        nameParent.appendChild(badge);
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

      // Wait for profile to render — poll for the h1 instead of a fixed timeout
      let attempts = 0;
      while (!findProfileName() && attempts < 20) {
        await new Promise((r) => setTimeout(r, 250));
        attempts++;
      }

      await injectBadge();
    }

    // Initial load
    await handleNavigation();

    // LinkedIn is a SPA — watch for URL changes
    ctx.setInterval(() => {
      const profileId = extractProfileId(window.location.href);
      if (profileId !== currentProfileId) {
        handleNavigation();
      }
    }, 500);
  },
});
