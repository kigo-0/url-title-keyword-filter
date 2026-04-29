# URL & Title Keyword Filter

A browser extension that detects prohibited keywords in both the URL and page title, and automatically closes the tab when a match is found.

## Features
- Scans the URL and page title for blocked keywords
- Automatically closes the tab when a keyword is detected

## How It Works
1. The extension loads two keyword lists:
   - `title_keywords.txt` for detecting keywords in the page title
   - `url_keywords.txt` for detecting keywords in the page URL
2. Whenever a tab is opened, the extension checks:
   - The current page URL against `url_keywords.txt`
   - The page title against `title_keywords.txt`
3. If any keyword matches, the tab is closed.

## Installation
1. Download or clone this repository.
2. Open **chrome://extensions/**
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.