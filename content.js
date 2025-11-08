// Listen for copy events
document.addEventListener('copy', function(e) {
  const selection = window.getSelection();

  if (!selection || selection.toString().trim() === '') {
    return;
  }

  const entries = [];

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();

    // Find all links within the selection
    const links = fragment.querySelectorAll('a[href]');

    if (links.length > 0) {
      // Create one entry per link
      links.forEach(linkElement => {
        const text = linkElement.textContent.trim();
        const link = linkElement.href;

        if (text && link) {
          entries.push({
            text: text,
            link: link,
            timestamp: new Date().toISOString()
          });
        }
      });
    } else {
      // No links found, create single entry with selected text and current URL
      entries.push({
        text: selection.toString().trim(),
        link: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (entries.length > 0) {
    console.log('Captured copy event, entries:', entries);

    // Save to chrome storage
    chrome.storage.local.get(['copyHistory'], function(result) {
      const history = result.copyHistory || [];
      history.push(...entries); // Add all entries
      chrome.storage.local.set({ copyHistory: history }, function() {
        console.log('Saved to storage. Total entries:', history.length);
      });
    });
  }
});
