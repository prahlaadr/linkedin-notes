export default defineBackground(() => {
  // Listen for messages from content script if needed
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'get-note-count') {
      browser.storage.local.get('linkedin-notes-index').then((result) => {
        const index = result['linkedin-notes-index'] as { profiles?: unknown[] } | undefined;
        sendResponse({ count: index?.profiles?.length ?? 0 });
      });
      return true; // async response
    }
  });
});
