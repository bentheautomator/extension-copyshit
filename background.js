// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveLinkAndText',
    title: 'Save Link and Text to CSV',
    contexts: ['selection', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveLinkAndText') {
    let text = '';
    let link = '';

    // If right-clicked on a link
    if (info.linkUrl) {
      link = info.linkUrl;
      text = info.selectionText || info.linkUrl;
    }
    // If text is selected
    else if (info.selectionText) {
      text = info.selectionText.trim();
      link = info.pageUrl; // Use current page URL
    }

    if (text && link) {
      const entry = {
        text: text,
        link: link,
        timestamp: new Date().toISOString()
      };

      // Save to chrome storage
      chrome.storage.local.get(['copyHistory'], (result) => {
        const history = result.copyHistory || [];
        history.push(entry);
        chrome.storage.local.set({ copyHistory: history });
      });
    }
  }
});
