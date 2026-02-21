const PROFILE_REGEX = /linkedin\.com\/in\/([^\/?#]+)/;

export function extractProfileId(url: string): string | null {
  const match = url.match(PROFILE_REGEX);
  return match ? match[1] : null;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// Tag color palette
const TAG_COLORS = [
  '#e0f2fe', // blue
  '#fce7f3', // pink
  '#d1fae5', // green
  '#fef3c7', // yellow
  '#ede9fe', // purple
  '#ffe4e6', // rose
  '#ffedd5', // orange
  '#f0fdf4', // lime
  '#e0e7ff', // indigo
  '#f5f5f4', // stone
];

const TAG_TEXT_COLORS = [
  '#0369a1',
  '#be185d',
  '#047857',
  '#b45309',
  '#6d28d9',
  '#be123c',
  '#c2410c',
  '#15803d',
  '#4338ca',
  '#57534e',
];

export function getTagColor(tag: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % TAG_COLORS.length;
  return { bg: TAG_COLORS[idx], text: TAG_TEXT_COLORS[idx] };
}
