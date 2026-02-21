export interface ProfileNote {
  profileId: string;
  profileName: string;
  profileUrl: string;
  profileImageUrl?: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesIndex {
  profiles: IndexEntry[];
}

export interface IndexEntry {
  profileId: string;
  profileName: string;
  profileUrl: string;
  profileImageUrl?: string;
  tags: string[];
  updatedAt: string;
  preview: string; // First ~100 chars of notes
}
