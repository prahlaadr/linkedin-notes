import type { ProfileNote, NotesIndex, IndexEntry } from './types';

const INDEX_KEY = 'linkedin-notes-index';
const NOTE_PREFIX = 'note:';

function noteKey(profileId: string): string {
  return `${NOTE_PREFIX}${profileId}`;
}

function makePreview(notes: string): string {
  return notes.slice(0, 100).replace(/\n/g, ' ').trim();
}

export async function getNote(profileId: string): Promise<ProfileNote | null> {
  const result = await browser.storage.local.get(noteKey(profileId));
  return (result[noteKey(profileId)] as ProfileNote) ?? null;
}

export async function saveNote(note: ProfileNote): Promise<void> {
  note.updatedAt = new Date().toISOString();
  await browser.storage.local.set({ [noteKey(note.profileId)]: note });
  await updateIndex(note);
}

export async function deleteNote(profileId: string): Promise<void> {
  await browser.storage.local.remove(noteKey(profileId));
  await removeFromIndex(profileId);
}

export async function getIndex(): Promise<NotesIndex> {
  const result = await browser.storage.local.get(INDEX_KEY);
  return (result[INDEX_KEY] as NotesIndex) ?? { profiles: [] };
}

async function updateIndex(note: ProfileNote): Promise<void> {
  const index = await getIndex();
  const entry: IndexEntry = {
    profileId: note.profileId,
    profileName: note.profileName,
    profileUrl: note.profileUrl,
    profileImageUrl: note.profileImageUrl,
    tags: note.tags,
    updatedAt: note.updatedAt,
    preview: makePreview(note.notes),
  };

  const existing = index.profiles.findIndex(
    (p) => p.profileId === note.profileId
  );
  if (existing >= 0) {
    index.profiles[existing] = entry;
  } else {
    index.profiles.push(entry);
  }

  // Sort by most recently updated
  index.profiles.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  await browser.storage.local.set({ [INDEX_KEY]: index });
}

async function removeFromIndex(profileId: string): Promise<void> {
  const index = await getIndex();
  index.profiles = index.profiles.filter((p) => p.profileId !== profileId);
  await browser.storage.local.set({ [INDEX_KEY]: index });
}

export async function getAllTags(): Promise<string[]> {
  const index = await getIndex();
  const tagSet = new Set<string>();
  for (const profile of index.profiles) {
    for (const tag of profile.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export async function exportAllNotes(): Promise<ProfileNote[]> {
  const index = await getIndex();
  const notes: ProfileNote[] = [];
  for (const entry of index.profiles) {
    const note = await getNote(entry.profileId);
    if (note) notes.push(note);
  }
  return notes;
}
