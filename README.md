# URL & Title Keyword Filter

A browser extension that detects prohibited keywords in both the URL and page title, and automatically closes the tab when a match is found.

## Features
- Scans the URL and page title for blocked keywords
- Automatically closes the tab when a keyword is detected

## How It Works
1. Keyword lists (URL keywords and title keywords) are stored in `chrome.storage.local`, managed entirely through the extension's **Options** page.
2. Whenever a tab is opened, the extension checks:
   - The current page URL against the stored URL keywords
   - The page title against the stored title keywords
3. If any keyword matches, the tab is closed.
4. Keyword lists can be edited anytime from the Options page (`chrome://extensions` → Details → Extension options) and take effect immediately, without reloading the extension.

## Installation
1. Download or clone this repository.
2. Open **chrome://extensions/**
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.
6. Open the extension's **Options** page and enter your URL/title keywords.

## Moving Your Settings to a New Environment
Use the **Export** / **Import** buttons on the Options page:
1. On the old environment, click **Export** for each list to download `url_keywords.txt` / `title_keywords.txt`.
2. On the new environment, open the Options page, click **Import**, and select the downloaded file.
3. Click **Save** to apply.