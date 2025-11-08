// Listen for copy events
document.addEventListener('copy', function(e) {
  const selection = window.getSelection();

  console.log('[COPY EVENT] Triggered');
  console.log('[COPY EVENT] Selection text:', selection ? selection.toString() : 'null');

  if (!selection || selection.toString().trim() === '') {
    console.log('[COPY EVENT] No selection, ignoring');
    return;
  }

  const entries = [];

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();

    console.log('[COPY EVENT] Range count:', selection.rangeCount);

    // Find all links within the selection
    const links = fragment.querySelectorAll('a[href]');

    console.log('[COPY EVENT] Found', links.length, 'links in selection');

    if (links.length > 0) {
      // Create one entry per link
      links.forEach((linkElement, index) => {
        const text = linkElement.textContent.trim();
        const link = linkElement.href;

        console.log(`[COPY EVENT] Link ${index + 1}:`, { text, link });

        if (text && link) {
          entries.push({
            text: text,
            link: link,
            timestamp: new Date().toISOString()
          });
        }
      });
    } else {
      console.log('[COPY EVENT] No links found, using selection text and current URL');
      // No links found, create single entry with selected text and current URL
      entries.push({
        text: selection.toString().trim(),
        link: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  console.log('[COPY EVENT] Total entries to save:', entries.length);
  console.log('[COPY EVENT] Entries:', entries);

  if (entries.length > 0) {
    // Save to chrome storage
    chrome.storage.local.get(['copyHistory'], function(result) {
      const history = result.copyHistory || [];
      console.log('[COPY EVENT] Current history length:', history.length);
      history.push(...entries); // Add all entries
      console.log('[COPY EVENT] New history length:', history.length);
      chrome.storage.local.set({ copyHistory: history }, function() {
        console.log('[COPY EVENT] ✓ Saved to storage. Total entries now:', history.length);
      });
    });
  }
});
