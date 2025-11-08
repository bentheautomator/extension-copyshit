// Load and display history when popup opens
document.addEventListener('DOMContentLoaded', function() {
  loadHistory();

  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('clearBtn').addEventListener('click', clearHistory);
});

function loadHistory() {
  console.log('[POPUP] Loading history...');
  chrome.storage.local.get(['copyHistory'], function(result) {
    const history = result.copyHistory || [];
    const historyList = document.getElementById('historyList');
    const countElement = document.getElementById('count');

    console.log('[POPUP] History loaded, entries:', history.length);
    console.log('[POPUP] Full history:', history);

    countElement.textContent = history.length;

    if (history.length === 0) {
      historyList.innerHTML = '<p style="color: #666; font-size: 12px;">No copy history yet. Start copying text with links!</p>';
      return;
    }

    // Display most recent first
    const recentEntries = history.slice().reverse().slice(0, 10);
    console.log('[POPUP] Displaying', recentEntries.length, 'recent entries');

    historyList.innerHTML = recentEntries.map((entry, index) => {
      console.log(`[POPUP] Entry ${index + 1}:`, entry);
      return `
      <div class="history-item">
        <div class="text">${escapeHtml(entry.text.substring(0, 100))}${entry.text.length > 100 ? '...' : ''}</div>
        <a href="${escapeHtml(entry.link)}" target="_blank" class="link">${escapeHtml(entry.link)}</a>
      </div>
    `;
    }).join('');
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyToClipboard() {
  console.log('[POPUP] Copy to clipboard clicked');
  chrome.storage.local.get(['copyHistory'], function(result) {
    const history = result.copyHistory || [];

    console.log('[POPUP] Copy - History entries:', history.length);
    console.log('[POPUP] Copy - Full history:', history);

    if (history.length === 0) {
      console.log('[POPUP] Copy - No data to copy');
      showStatus('No data to copy');
      return;
    }

    // Create CSV content
    let csvContent = 'Text,Link,Timestamp\n';

    history.forEach((entry, index) => {
      // Escape quotes and wrap fields in quotes for CSV
      const text = '"' + (entry.text || '').replace(/"/g, '""') + '"';
      const link = '"' + (entry.link || '').replace(/"/g, '""') + '"';
      const timestamp = '"' + (entry.timestamp || '') + '"';

      const row = `${text},${link},${timestamp}\n`;
      console.log(`[POPUP] Copy - Row ${index + 1}:`, row);
      csvContent += row;
    });

    console.log('[POPUP] Copy - Full CSV content:');
    console.log(csvContent);
    console.log('[POPUP] Copy - CSV length:', csvContent.length, 'characters');

    // Copy to clipboard
    navigator.clipboard.writeText(csvContent).then(() => {
      console.log('[POPUP] ✓ Successfully copied to clipboard');
      showStatus('CSV copied to clipboard!');
    }).catch(err => {
      console.error('[POPUP] ✗ Clipboard error:', err);
      showStatus('Failed to copy: ' + err.message);
    });
  });
}

function clearHistory() {
  console.log('[POPUP] Clear history clicked');
  if (confirm('Are you sure you want to clear all copy history?')) {
    console.log('[POPUP] User confirmed clear');
    chrome.storage.local.set({ copyHistory: [] }, function() {
      console.log('[POPUP] ✓ History cleared');
      loadHistory();
      showStatus('History cleared');
    });
  } else {
    console.log('[POPUP] User cancelled clear');
  }
}

function showStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'success';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
