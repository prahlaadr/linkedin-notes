import { useState, useEffect } from 'react';
import { getIndex, getNote, exportAllNotes, getAllTags, deleteNote } from '@/lib/storage';
import { timeAgo, getTagColor } from '@/lib/utils';
import type { IndexEntry, ProfileNote } from '@/lib/types';

export default function Dashboard() {
  const [entries, setEntries] = useState<IndexEntry[]>([]);
  const [notes, setNotes] = useState<Record<string, ProfileNote>>({});
  const [allTags, setAllTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const index = await getIndex();
    setEntries(index.profiles);

    const tags = await getAllTags();
    setAllTags(tags);

    // Load all full notes
    const allNotes: Record<string, ProfileNote> = {};
    for (const entry of index.profiles) {
      const note = await getNote(entry.profileId);
      if (note) allNotes[entry.profileId] = note;
    }
    setNotes(allNotes);
  }

  const filtered = entries.filter((entry) => {
    const q = search.toLowerCase();
    const note = notes[entry.profileId];

    const matchesSearch =
      !q ||
      entry.profileName.toLowerCase().includes(q) ||
      (note?.notes ?? '').toLowerCase().includes(q) ||
      entry.tags.some((t) => t.includes(q));

    const matchesTags =
      activeTags.length === 0 ||
      activeTags.every((t) => entry.tags.includes(t));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleExport = async () => {
    const allNotes = await exportAllNotes();
    const blob = new Blob([JSON.stringify(allNotes, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Delete notes for this person?')) return;
    await deleteNote(profileId);
    await loadData();
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <h1>LinkedIn Notes</h1>
          <span className="count">{filtered.length} of {entries.length} people</span>
        </div>
        <button className="export-btn" onClick={handleExport}>
          Export JSON
        </button>
      </header>

      <div className="controls">
        <input
          className="search"
          type="text"
          placeholder="Search names, notes, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        {allTags.length > 0 && (
          <div className="tags-bar">
            {allTags.map((tag) => {
              const { bg, text } = getTagColor(tag);
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  className={`tag-chip ${isActive ? 'active' : ''}`}
                  style={
                    isActive
                      ? { background: text, color: '#fff' }
                      : { background: bg, color: text }
                  }
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {isActive && ' ✕'}
                </button>
              );
            })}
            {activeTags.length > 0 && (
              <button className="clear-tags" onClick={() => setActiveTags([])}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {entries.length === 0
            ? 'No notes yet. Visit LinkedIn profiles and click the 📝 icon to start adding notes.'
            : 'No profiles match your search.'}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="col-person">Person</th>
                <th className="col-notes">Notes</th>
                <th className="col-tags">Tags</th>
                <th className="col-updated">Updated</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const note = notes[entry.profileId];
                const isExpanded = expandedId === entry.profileId;
                return (
                  <tr
                    key={entry.profileId}
                    className={isExpanded ? 'expanded' : ''}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : entry.profileId)
                    }
                  >
                    <td className="col-person">
                      <div className="person">
                        {entry.profileImageUrl && (
                          <img
                            src={entry.profileImageUrl}
                            alt=""
                            className="avatar"
                          />
                        )}
                        <div>
                          <a
                            href={entry.profileUrl}
                            target="_blank"
                            rel="noopener"
                            className="person-name"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {entry.profileName}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="col-notes">
                      <div className={`notes-text ${isExpanded ? 'expanded' : ''}`}>
                        {note?.notes || '—'}
                      </div>
                    </td>
                    <td className="col-tags">
                      <div className="tags-cell">
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
                    </td>
                    <td className="col-updated">
                      <span className="time">{timeAgo(entry.updatedAt)}</span>
                    </td>
                    <td className="col-actions">
                      <button
                        className="delete-btn"
                        title="Delete notes"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.profileId);
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
