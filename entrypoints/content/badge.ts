const FLOATING_CLASS = 'linkedin-notes-badge-floating';

function makeButton(onClick: () => void): HTMLButtonElement {
  const badge = document.createElement('button');
  badge.className = 'linkedin-notes-badge';
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return badge;
}

// Inline badge — sits next to the profile name.
export function createBadge(
  hasNotes: boolean,
  onClick: () => void
): HTMLElement {
  const badge = makeButton(onClick);
  applyInlineStyles(badge, hasNotes);
  return badge;
}

// Floating badge — self-positioned, does NOT depend on any LinkedIn element,
// so it survives any LinkedIn DOM change. Used as a fallback anchor.
export function createFloatingBadge(
  hasNotes: boolean,
  onClick: () => void
): HTMLElement {
  const badge = makeButton(onClick);
  badge.classList.add(FLOATING_CLASS);
  applyFloatingStyles(badge, hasNotes);
  return badge;
}

export function updateBadge(badge: HTMLElement, hasNotes: boolean): void {
  if (badge.classList.contains(FLOATING_CLASS)) {
    applyFloatingStyles(badge, hasNotes);
  } else {
    applyInlineStyles(badge, hasNotes);
  }
}

function applyInlineStyles(badge: HTMLElement, hasNotes: boolean): void {
  badge.textContent = '📝';
  badge.title = hasNotes ? 'View notes' : 'Add notes';
  Object.assign(badge.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '8px',
    verticalAlign: 'middle',
    background: hasNotes ? '#e0f2fe' : '#f5f5f4',
    opacity: hasNotes ? '1' : '0.6',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    top: '-2px',
  });

  badge.onmouseenter = () => {
    badge.style.opacity = '1';
    badge.style.transform = 'scale(1.1)';
  };
  badge.onmouseleave = () => {
    badge.style.opacity = hasNotes ? '1' : '0.6';
    badge.style.transform = 'scale(1)';
  };
}

function applyFloatingStyles(badge: HTMLElement, hasNotes: boolean): void {
  badge.textContent = '📝';
  badge.title = hasNotes ? 'View notes' : 'Add notes';
  // Positioning uses !important so LinkedIn's stylesheet can't override it.
  badge.style.setProperty('position', 'fixed', 'important');
  badge.style.setProperty('right', '20px', 'important');
  badge.style.setProperty('bottom', '20px', 'important');
  badge.style.setProperty('z-index', '2147483647', 'important');
  Object.assign(badge.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontSize: '22px',
    background: hasNotes ? '#e0f2fe' : '#ffffff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease',
  });

  badge.onmouseenter = () => {
    badge.style.transform = 'scale(1.1)';
  };
  badge.onmouseleave = () => {
    badge.style.transform = 'scale(1)';
  };
}
