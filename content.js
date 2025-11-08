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
        // Try multiple methods to get meaningful text for the link
        let text = '';

        // Method 1: Look for text in span elements (common on Facebook, LinkedIn, etc)
        const spanElement = linkElement.querySelector('span');
        if (spanElement && spanElement.textContent && spanElement.textContent.trim()) {
          text = spanElement.textContent.trim();
        }

        // Method 2: innerText (won't work on cloned fragments but try anyway)
        if (!text && linkElement.innerText && linkElement.innerText.trim()) {
          text = linkElement.innerText.trim();
        }

        // Method 3: Direct text nodes only (exclude nested elements)
        if (!text) {
          const directTextNodes = Array.from(linkElement.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .filter(text => text.length > 0);

          if (directTextNodes.length > 0) {
            text = directTextNodes.join(' ');
          }
        }

        // Method 4: aria-label attribute
        if (!text && linkElement.getAttribute('aria-label')) {
          text = linkElement.getAttribute('aria-label').trim();
        }

        // Method 5: title attribute
        if (!text && linkElement.getAttribute('title')) {
          text = linkElement.getAttribute('title').trim();
        }

        // Method 6: textContent as last resort (may include too much)
        if (!text && linkElement.textContent) {
          text = linkElement.textContent.trim();
        }

        // Method 7: Use URL as final fallback
        if (!text) {
          text = linkElement.href;
        }

        const link = linkElement.href;

        console.log(`[COPY EVENT] Link ${index + 1}:`, {
          text,
          link,
          innerText: linkElement.innerText?.substring(0, 50),
          textContent: linkElement.textContent?.substring(0, 50),
          ariaLabel: linkElement.getAttribute('aria-label'),
          title: linkElement.getAttribute('title')
        });

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

      // Filter out duplicates
      const newEntries = entries.filter(entry => {
        const isDuplicate = history.some(existing =>
          existing.text === entry.text && existing.link === entry.link
        );
        if (isDuplicate) {
          console.log('[COPY EVENT] Skipping duplicate:', entry.text, entry.link);
        }
        return !isDuplicate;
      });

      console.log('[COPY EVENT] New unique entries to add:', newEntries.length);

      if (newEntries.length > 0) {
        history.push(...newEntries); // Add only unique entries
        console.log('[COPY EVENT] New history length:', history.length);
        chrome.storage.local.set({ copyHistory: history }, function() {
          console.log('[COPY EVENT] ✓ Saved to storage. Total entries now:', history.length);
        });
      } else {
        console.log('[COPY EVENT] No new entries to save (all duplicates)');
      }
    });
  }
});
