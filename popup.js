// Load and display history when popup opens
document.addEventListener('DOMContentLoaded', function() {
  loadHistory();

  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('clearBtn').addEventListener('click', clearHistory);
});

function loadHistory() {
  chrome.storage.local.get(['copyHistory'], function(result) {
    const history = result.copyHistory || [];
    const historyList = document.getElementById('historyList');
    const countElement = document.getElementById('count');

    countElement.textContent = history.length;

    if (history.length === 0) {
      historyList.innerHTML = '<p style="color: #666; font-size: 12px;">No copy history yet. Start copying text with links!</p>';
      return;
    }

    // Display most recent first
    historyList.innerHTML = history.slice().reverse().slice(0, 10).map(entry => `
      <div class="history-item">
        <div class="text">${escapeHtml(entry.text.substring(0, 100))}${entry.text.length > 100 ? '...' : ''}</div>
        <a href="${escapeHtml(entry.link)}" target="_blank" class="link">${escapeHtml(entry.link)}</a>
      </div>
    `).join('');
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyToClipboard() {
  chrome.storage.local.get(['copyHistory'], function(result) {
    const history = result.copyHistory || [];

    console.log('Copy history:', history);

    if (history.length === 0) {
      showStatus('No data to copy');
      return;
    }

    // Create CSV content
    let csvContent = 'Text,Link,Timestamp\n';

    history.forEach(entry => {
      // Escape quotes and wrap fields in quotes for CSV
      const text = '"' + (entry.text || '').replace(/"/g, '""') + '"';
      const link = '"' + (entry.link || '').replace(/"/g, '""') + '"';
      const timestamp = '"' + (entry.timestamp || '') + '"';

      csvContent += `${text},${link},${timestamp}\n`;
    });

    console.log('CSV content to copy:', csvContent);

    // Copy to clipboard
    navigator.clipboard.writeText(csvContent).then(() => {
      showStatus('CSV copied to clipboard!');
    }).catch(err => {
      console.error('Clipboard error:', err);
      showStatus('Failed to copy: ' + err.message);
    });
  });
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all copy history?')) {
    chrome.storage.local.set({ copyHistory: [] }, function() {
      loadHistory();
      showStatus('History cleared');
    });
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
