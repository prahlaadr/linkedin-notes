export function createBadge(
  hasNotes: boolean,
  onClick: () => void
): HTMLElement {
  const badge = document.createElement('button');
  badge.className = 'linkedin-notes-badge';
  badge.title = hasNotes ? 'View notes' : 'Add notes';
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });

  applyBadgeStyles(badge, hasNotes);
  return badge;
}

export function updateBadge(badge: HTMLElement, hasNotes: boolean): void {
  applyBadgeStyles(badge, hasNotes);
  badge.title = hasNotes ? 'View notes' : 'Add notes';
}

function applyBadgeStyles(badge: HTMLElement, hasNotes: boolean): void {
  badge.textContent = hasNotes ? '📝' : '📝';
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
