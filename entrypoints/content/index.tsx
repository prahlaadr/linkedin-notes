import ReactDOM from 'react-dom/client';
import { extractProfileId } from '@/lib/utils';
import { getNote } from '@/lib/storage';
import { NotesOverlay } from './components/NotesOverlay';
import { createBadge, updateBadge } from './badge';

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

      const nameEl = document.querySelector(
        'h1.text-heading-xlarge'
      ) as HTMLElement | null;
      const headlineEl = document.querySelector(
        '.text-body-medium.break-words'
      ) as HTMLElement | null;
      const imgEl = document.querySelector(
        'img.pv-top-card-profile-picture__image--show'
      ) as HTMLImageElement | null;

      return {
        profileId,
        profileName: nameEl?.innerText?.trim() ?? profileId,
        headline: headlineEl?.innerText?.trim() ?? '',
        profileUrl: window.location.href.split('?')[0],
        profileImageUrl: imgEl?.src,
      };
    }

    async function injectBadge() {
      const nameEl = document.querySelector('h1.text-heading-xlarge');
      if (!nameEl || badge?.isConnected) return;

      const profileId = extractProfileId(window.location.href);
      if (!profileId) return;

      const existing = await getNote(profileId);
      badge = createBadge(!!existing, () => openOverlay());
      nameEl.parentElement?.insertBefore(badge, nameEl.nextSibling);
    }

    function openOverlay() {
      const info = getProfileInfo();
      if (!info) return;

      // Create container
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

      // Wait for profile to render
      await new Promise((r) => setTimeout(r, 1000));
      await injectBadge();
    }

    // Initial load
    await handleNavigation();

    // LinkedIn is a SPA — watch for URL changes
    const observer = ctx.setInterval(() => {
      const profileId = extractProfileId(window.location.href);
      if (profileId !== currentProfileId) {
        handleNavigation();
      }
    }, 500);
  },
});
