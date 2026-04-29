(async () => {
    const normalize = s => (s || "").toLowerCase();

    async function loadTxt(path) {
        const res = await fetch(chrome.runtime.getURL(path));
        const text = await res.text();
        return text
            .split(/\r?\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    const URL_KEYWORDS = await loadTxt("url_keywords.txt");
    const TITLE_KEYWORDS = await loadTxt("title_keywords.txt");

    function wildcardToRegExp(pattern) {
        const escaped = pattern
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/\?/g, ".");
        return new RegExp(escaped, "i");
    }

    function matchWildcard(str, patterns) {
        return patterns.find(p => wildcardToRegExp(p).test(str));
    }

    function check() {
        const url = normalize(location.href);
        const title = normalize(document.title);

        const hitUrl = matchWildcard(url, URL_KEYWORDS);
        const hitTitle = matchWildcard(title, TITLE_KEYWORDS);

        if (!hitUrl && !hitTitle) return;

        const hitType = hitUrl ? "URL" : "Title";
        const hitWord = hitUrl || hitTitle;

        const message =
            `NGワードを検出しました。\n` +
            `種類: ${hitType}\n` +
            `キーワード: ${hitWord}\n\n` +
            `OK を押すとこのタブは閉じられます。`;

        alert(message);

        chrome.runtime.sendMessage({ action: "close_tab" });
    }

    check();
    window.addEventListener("load", check);
    setTimeout(check, 1000);
})();
