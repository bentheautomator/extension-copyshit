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
    console.log('[CONTEXT MENU] Clicked');
    console.log('[CONTEXT MENU] Info:', info);
    console.log('[CONTEXT MENU] Tab:', tab);
    console.log('[CONTEXT MENU] linkUrl:', info.linkUrl);
    console.log('[CONTEXT MENU] selectionText:', info.selectionText);
    console.log('[CONTEXT MENU] pageUrl:', info.pageUrl);

    // Execute script on the page to extract link text properly
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (linkUrl) => {
        // Find the link element that was clicked
        const links = document.querySelectorAll('a[href]');
        console.log('[CONTEXT MENU SCRIPT] Looking for linkUrl:', linkUrl);
        console.log('[CONTEXT MENU SCRIPT] Total links on page:', links.length);
        for (let link of links) {
          if (link.href === linkUrl) {
            console.log('[CONTEXT MENU SCRIPT] Found matching link, text:', link.textContent.trim());
            return link.textContent.trim();
          }
        }
        console.log('[CONTEXT MENU SCRIPT] No matching link found');
        return null;
      },
      args: [info.linkUrl]
    }).then(results => {
      console.log('[CONTEXT MENU] Script results:', results);

      let text = '';
      let link = '';

      // If right-clicked on a link
      if (info.linkUrl) {
        link = info.linkUrl;
        // Use the extracted link text, or fallback to selectionText or URL
        text = (results && results[0] && results[0].result) || info.selectionText || info.linkUrl;
        console.log('[CONTEXT MENU] Using link mode, text:', text, 'link:', link);
      }
      // If text is selected
      else if (info.selectionText) {
        text = info.selectionText.trim();
        link = info.pageUrl; // Use current page URL
        console.log('[CONTEXT MENU] Using selection mode, text:', text, 'link:', link);
      }

      if (text && link) {
        const entry = {
          text: text,
          link: link,
          timestamp: new Date().toISOString()
        };

        console.log('[CONTEXT MENU] Creating entry:', entry);

        // Save to chrome storage
        chrome.storage.local.get(['copyHistory'], (result) => {
          const history = result.copyHistory || [];
          console.log('[CONTEXT MENU] Current history length:', history.length);
          history.push(entry);
          console.log('[CONTEXT MENU] New history length:', history.length);
          chrome.storage.local.set({ copyHistory: history }, () => {
            console.log('[CONTEXT MENU] ✓ Saved. Total entries:', history.length);
          });
        });
      } else {
        console.log('[CONTEXT MENU] ✗ No text or link to save');
      }
    }).catch(err => {
      console.error('[CONTEXT MENU] ✗ Error:', err);
      // Fallback to simple save
      if (info.linkUrl) {
        const entry = {
          text: info.selectionText || info.linkUrl,
          link: info.linkUrl,
          timestamp: new Date().toISOString()
        };
        console.log('[CONTEXT MENU] Using fallback entry:', entry);
        chrome.storage.local.get(['copyHistory'], (result) => {
          const history = result.copyHistory || [];
          history.push(entry);
          chrome.storage.local.set({ copyHistory: history });
        });
      }
    });
  }
});
