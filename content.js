// Listen for copy events
document.addEventListener('copy', function(e) {
  const selection = window.getSelection();

  if (!selection || selection.toString().trim() === '') {
    return;
  }

  let text = '';
  let link = '';
  let linkElement = null;

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Try to find a link in the selection
    let element = container.nodeType === 1 ? container : container.parentElement;

    // Check if the selection contains or is within a link
    while (element && element !== document.body) {
      if (element.tagName === 'A' && element.href) {
        linkElement = element;
        break;
      }
      element = element.parentElement;
    }

    // If no parent link found, check if selection contains a link
    if (!linkElement && container.nodeType === 1) {
      linkElement = container.querySelector('a');
    } else if (!linkElement && range.cloneContents) {
      const fragment = range.cloneContents();
      linkElement = fragment.querySelector('a');
    }
  }

  // If we found a link, use its text and href
  if (linkElement && linkElement.href) {
    text = linkElement.textContent.trim();
    link = linkElement.href;
  } else {
    // No link found, use selected text and current page URL
    text = selection.toString().trim();
    link = window.location.href;
  }

  // Store the data
  const entry = {
    text: text,
    link: link,
    timestamp: new Date().toISOString()
  };

  console.log('Captured copy event:', entry);

  // Save to chrome storage
  chrome.storage.local.get(['copyHistory'], function(result) {
    const history = result.copyHistory || [];
    history.push(entry);
    chrome.storage.local.set({ copyHistory: history }, function() {
      console.log('Saved to storage. Total entries:', history.length);
    });
  });
});
