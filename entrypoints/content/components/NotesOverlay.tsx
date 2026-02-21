import { useState, useEffect, useCallback, useRef } from 'react';
import { getNote, saveNote, getAllTags } from '@/lib/storage';
import { debounce, timeAgo } from '@/lib/utils';
import { TagChips } from './TagChips';
import type { ProfileNote } from '@/lib/types';

interface Props {
  profileId: string;
  profileName: string;
  headline: string;
  profileUrl: string;
  profileImageUrl?: string;
  onClose: () => void;
  onSaved: (hasNotes: boolean) => void;
}

export function NotesOverlay({
  profileId,
  profileName,
  headline,
  profileUrl,
  profileImageUrl,
  onClose,
  onSaved,
}: Props) {
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>(
    'idle'
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      const existing = await getNote(profileId);
      if (existing) {
        setNotes(existing.notes);
        setTags(existing.tags);
        setUpdatedAt(existing.updatedAt);
      }
      const tags = await getAllTags();
      setAllTags(tags);
    })();
  }, [profileId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const persistNote = useCallback(
    debounce(async (currentNotes: string, currentTags: string[]) => {
      setSaveStatus('saving');
      const existing = await getNote(profileId);
      const note: ProfileNote = {
        profileId,
        profileName,
        profileUrl,
        profileImageUrl,
        notes: currentNotes,
        tags: currentTags,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Don't save if both notes and tags are empty
      if (!currentNotes.trim() && currentTags.length === 0) {
        setSaveStatus('idle');
        onSaved(false);
        return;
      }

      await saveNote(note);
      setUpdatedAt(note.updatedAt);
      setSaveStatus('saved');
      onSaved(true);
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 500),
    [profileId, profileName, profileUrl, profileImageUrl]
  );

  const handleNotesChange = (value: string) => {
    setNotes(value);
    persistNote(value, tags);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    persistNote(notes, newTags);
  };

  return (
    <>
      <style>{overlayStyles}</style>
      <div className="ln-backdrop" onClick={onClose}>
        <div className="ln-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ln-header">
            <div className="ln-profile-info">
              {profileImageUrl && (
                <img
                  src={profileImageUrl}
                  alt=""
                  className="ln-avatar"
                />
              )}
              <div>
                <div className="ln-name">{profileName}</div>
                {headline && (
                  <div className="ln-headline">{headline}</div>
                )}
              </div>
            </div>
            <button className="ln-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Notes */}
          <div className="ln-body">
            <textarea
              ref={textareaRef}
              className="ln-textarea"
              placeholder="How did you meet? What did you talk about? What to remember..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={6}
            />

            {/* Tags */}
            <TagChips
              tags={tags}
              allTags={allTags}
              onChange={handleTagsChange}
            />
          </div>

          {/* Footer */}
          <div className="ln-footer">
            <span className="ln-timestamp">
              {updatedAt ? `Updated ${timeAgo(updatedAt)}` : 'New note'}
            </span>
            <span className="ln-save-status">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

const overlayStyles = `
  .ln-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: ln-fade-in 0.15s ease;
  }

  @keyframes ln-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes ln-slide-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ln-modal {
    background: #fff;
    border-radius: 12px;
    width: 480px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: ln-slide-up 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .ln-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .ln-profile-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .ln-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .ln-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    line-height: 1.3;
  }

  .ln-headline {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.3;
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ln-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    line-height: 1;
    flex-shrink: 0;
  }

  .ln-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .ln-body {
    padding: 16px 20px;
    overflow-y: auto;
    flex: 1;
  }

  .ln-textarea {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    color: #111827;
    background: #fafafa;
    box-sizing: border-box;
    min-height: 120px;
  }

  .ln-textarea:focus {
    outline: none;
    border-color: #0a66c2;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(10, 102, 194, 0.1);
  }

  .ln-textarea::placeholder {
    color: #9ca3af;
  }

  .ln-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .ln-timestamp {
    font-size: 12px;
    color: #9ca3af;
  }

  .ln-save-status {
    font-size: 12px;
    color: #059669;
    min-width: 60px;
    text-align: right;
  }

  /* Dark mode - detect LinkedIn's dark theme */
  body.theme--dark .ln-modal,
  html[data-theme="dark"] .ln-modal {
    background: #1b1f23;
  }

  body.theme--dark .ln-name,
  html[data-theme="dark"] .ln-name {
    color: #e5e7eb;
  }

  body.theme--dark .ln-textarea,
  html[data-theme="dark"] .ln-textarea {
    background: #2d333b;
    border-color: #444c56;
    color: #e5e7eb;
  }

  body.theme--dark .ln-textarea:focus,
  html[data-theme="dark"] .ln-textarea:focus {
    background: #2d333b;
  }

  body.theme--dark .ln-header,
  html[data-theme="dark"] .ln-header {
    border-color: #444c56;
  }

  body.theme--dark .ln-footer,
  html[data-theme="dark"] .ln-footer {
    background: #22272e;
    border-color: #444c56;
  }
`;
