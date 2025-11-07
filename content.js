// Listen for copy events
document.addEventListener('copy', function(e) {
  const selection = window.getSelection();

  if (!selection || selection.toString().trim() === '') {
    return;
  }

  // Get the selected text
  const selectedText = selection.toString().trim();

  // Get the range and extract links
  let link = '';

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Try to find a link in the selection
    let element = container.nodeType === 1 ? container : container.parentElement;

    // Check if the selection contains or is within a link
    while (element && element !== document.body) {
      if (element.tagName === 'A' && element.href) {
        link = element.href;
        break;
      }
      element = element.parentElement;
    }

    // If no parent link found, check if selection contains a link
    if (!link && container.nodeType === 1) {
      const linkInSelection = container.querySelector('a');
      if (linkInSelection && linkInSelection.href) {
        link = linkInSelection.href;
      }
    } else if (!link && range.cloneContents) {
      const fragment = range.cloneContents();
      const linkInFragment = fragment.querySelector('a');
      if (linkInFragment && linkInFragment.href) {
        link = linkInFragment.href;
      }
    }
  }

  // If no link found in selection, use the current page URL
  if (!link) {
    link = window.location.href;
  }

  // Store the data
  const entry = {
    text: selectedText,
    link: link,
    timestamp: new Date().toISOString()
  };

  // Save to chrome storage
  chrome.storage.local.get(['copyHistory'], function(result) {
    const history = result.copyHistory || [];
    history.push(entry);
    chrome.storage.local.set({ copyHistory: history });
  });
});
