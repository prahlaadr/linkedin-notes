import { useState, useEffect } from 'react';
import { getIndex, exportAllNotes, getAllTags } from '@/lib/storage';
import { timeAgo, getTagColor } from '@/lib/utils';
import type { IndexEntry } from '@/lib/types';

export default function App() {
  const [entries, setEntries] = useState<IndexEntry[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const index = await getIndex();
      setEntries(index.profiles);
      const tags = await getAllTags();
      setAllTags(tags);
    })();
  }, []);

  const filtered = entries.filter((entry) => {
    const matchesSearch =
      !search ||
      entry.profileName.toLowerCase().includes(search.toLowerCase()) ||
      entry.preview.toLowerCase().includes(search.toLowerCase()) ||
      entry.tags.some((t) => t.includes(search.toLowerCase()));

    const matchesTag = !filterTag || entry.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  const handleExport = async () => {
    const notes = await exportAllNotes();
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="popup">
      <div className="popup-header">
        <h1>LinkedIn Notes</h1>
        <button className="export-btn" onClick={handleExport} title="Export all notes as JSON">
          ↓ Export
        </button>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search names, notes, tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />

      {allTags.length > 0 && (
        <div className="tag-filters">
          {filterTag && (
            <button
              className="tag-filter active"
              onClick={() => setFilterTag(null)}
            >
              ✕ {filterTag}
            </button>
          )}
          {!filterTag &&
            allTags.slice(0, 8).map((tag) => {
              const { bg, text } = getTagColor(tag);
              return (
                <button
                  key={tag}
                  className="tag-filter"
                  style={{ background: bg, color: text }}
                  onClick={() => setFilterTag(tag)}
                >
                  {tag}
                </button>
              );
            })}
        </div>
      )}

      <div className="profile-list">
        {filtered.length === 0 && (
          <div className="empty">
            {entries.length === 0
              ? 'No notes yet. Visit a LinkedIn profile to get started.'
              : 'No matching profiles.'}
          </div>
        )}
        {filtered.map((entry) => (
          <a
            key={entry.profileId}
            className="profile-item"
            href={entry.profileUrl}
            target="_blank"
            rel="noopener"
          >
            <div className="profile-item-header">
              {entry.profileImageUrl && (
                <img src={entry.profileImageUrl} alt="" className="mini-avatar" />
              )}
              <div className="profile-item-info">
                <span className="profile-item-name">{entry.profileName}</span>
                <span className="profile-item-time">
                  {timeAgo(entry.updatedAt)}
                </span>
              </div>
            </div>
            {entry.preview && (
              <div className="profile-item-preview">{entry.preview}</div>
            )}
            {entry.tags.length > 0 && (
              <div className="profile-item-tags">
                {entry.tags.map((tag) => {
                  const { bg, text } = getTagColor(tag);
                  return (
                    <span
                      key={tag}
                      className="mini-tag"
                      style={{ background: bg, color: text }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </a>
        ))}
      </div>

      <div className="popup-footer">
        {entries.length} profile{entries.length !== 1 ? 's' : ''} with notes
      </div>
    </div>
  );
}
