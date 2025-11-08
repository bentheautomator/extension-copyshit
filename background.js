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
    console.log('Context menu clicked, info:', info);

    // Execute script on the page to extract link text properly
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (linkUrl) => {
        // Find the link element that was clicked
        const links = document.querySelectorAll('a[href]');
        for (let link of links) {
          if (link.href === linkUrl) {
            return link.textContent.trim();
          }
        }
        return null;
      },
      args: [info.linkUrl]
    }).then(results => {
      let text = '';
      let link = '';

      // If right-clicked on a link
      if (info.linkUrl) {
        link = info.linkUrl;
        // Use the extracted link text, or fallback to selectionText or URL
        text = (results && results[0] && results[0].result) || info.selectionText || info.linkUrl;
      }
      // If text is selected
      else if (info.selectionText) {
        text = info.selectionText.trim();
        link = info.pageUrl; // Use current page URL
      }

      console.log('Context menu saving:', { text, link });

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
          chrome.storage.local.set({ copyHistory: history }, () => {
            console.log('Context menu saved. Total entries:', history.length);
          });
        });
      }
    }).catch(err => {
      console.error('Context menu error:', err);
      // Fallback to simple save
      if (info.linkUrl) {
        const entry = {
          text: info.selectionText || info.linkUrl,
          link: info.linkUrl,
          timestamp: new Date().toISOString()
        };
        chrome.storage.local.get(['copyHistory'], (result) => {
          const history = result.copyHistory || [];
          history.push(entry);
          chrome.storage.local.set({ copyHistory: history });
        });
      }
    });
  }
});
