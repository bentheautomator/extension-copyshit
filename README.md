# Link and Text Copy Tracker

A simple Chrome extension that captures copied text and associated links into a CSV format.

## Features

- Automatically captures text and links when you copy content from any webpage
- Extracts links from selected content or uses the current page URL
- Stores all entries with timestamps
- Export all captured data as a CSV file
- Simple popup interface to view recent copies
- Clear history option

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Simply copy any text on a webpage (Ctrl+C or Cmd+C)
2. The extension will automatically capture:
   - The copied text
   - Any link associated with the selection (or the current page URL)
   - A timestamp
3. Click the extension icon to:
   - View your recent copy history
   - Download all data as a CSV file
   - Clear your history

## CSV Format

The exported CSV file contains three columns:
- **Text**: The copied text
- **Link**: The associated URL
- **Timestamp**: When the copy occurred (ISO 8601 format)

## Files

- `manifest.json` - Extension configuration
- `content.js` - Content script that captures copy events
- `popup.html` - Popup interface HTML
- `popup.js` - Popup interface logic

## Privacy

All data is stored locally in your browser using Chrome's storage API. Nothing is sent to external servers.