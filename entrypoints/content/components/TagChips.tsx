import { useState, useRef, useEffect } from 'react';
import { getTagColor } from '@/lib/utils';

interface Props {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagChips({ tags, allTags, onChange }: Props) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = allTags.filter(
    (t) =>
      t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t)
  );

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (!normalized || tags.includes(normalized)) return;
    onChange([...tags, normalized]);
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <style>{tagStyles}</style>
      <div className="ln-tags-container">
        {tags.map((tag) => {
          const { bg, text } = getTagColor(tag);
          return (
            <span
              key={tag}
              className="ln-tag"
              style={{ background: bg, color: text }}
            >
              {tag}
              <button
                className="ln-tag-remove"
                style={{ color: text }}
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          );
        })}
        <div className="ln-tag-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="ln-tag-input"
            placeholder={tags.length === 0 ? 'Add tags...' : ''}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
          />
          {showSuggestions && input && suggestions.length > 0 && (
            <div className="ln-suggestions">
              {suggestions.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  className="ln-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tagStyles = `
  .ln-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .ln-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
  }

  .ln-tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 0 0 0 2px;
    line-height: 1;
    opacity: 0.6;
  }

  .ln-tag-remove:hover {
    opacity: 1;
  }

  .ln-tag-input-wrapper {
    position: relative;
    flex: 1;
    min-width: 80px;
  }

  .ln-tag-input {
    border: none;
    outline: none;
    font-size: 12px;
    padding: 4px 0;
    width: 100%;
    background: transparent;
    color: inherit;
    font-family: inherit;
  }

  .ln-tag-input::placeholder {
    color: #9ca3af;
  }

  .ln-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    overflow: hidden;
    min-width: 140px;
  }

  .ln-suggestion {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: none;
    text-align: left;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    font-family: inherit;
  }

  .ln-suggestion:hover {
    background: #f3f4f6;
  }
`;
