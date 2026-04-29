(function() {
    const pushState = history.pushState;
    history.pushState = function() {
        pushState.apply(this, arguments);
        window.dispatchEvent(new Event("locationchange"));
    };

    const replaceState = history.replaceState;
    history.replaceState = function() {
        replaceState.apply(this, arguments);
        window.dispatchEvent(new Event("locationchange"));
    };

    window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
    });
})();

const normalize = s => (s || "").toLowerCase();

async function loadTxt(path) {
    const res = await fetch(chrome.runtime.getURL(path));
    const text = await res.text();
    return text
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

let URL_KEYWORDS = [];
let TITLE_KEYWORDS = [];

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
    if (!URL_KEYWORDS.length || !TITLE_KEYWORDS.length) return;

    const url = normalize(location.href);
    const title = normalize(document.title);

    const hitUrl = matchWildcard(url, URL_KEYWORDS);
    const hitTitle = matchWildcard(title, TITLE_KEYWORDS);

    if (!hitUrl && !hitTitle) return;

    const hitType = hitUrl ? "URL" : "Title";
    const hitWord = hitUrl || hitTitle;

    alert(
        `NGワードを検出しました。\n` +
        `種類: ${hitType}\n` +
        `キーワード: ${hitWord}\n\n` +
        `OK を押すとこのタブは閉じられます。`
    );

    chrome.runtime.sendMessage({ action: "close_tab" });
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "check") {
        check();
    }
});

window.addEventListener("locationchange", () => {
    check();
});

function waitForTitleAndObserve() {
    const titleEl = document.querySelector("title");
    if (!titleEl) {
        setTimeout(waitForTitleAndObserve, 50);
        return;
    }

    const titleObserver = new MutationObserver(() => {
        check();
    });

    titleObserver.observe(titleEl, { childList: true });
}

waitForTitleAndObserve();

(async () => {
    URL_KEYWORDS = await loadTxt("url_keywords.txt");
    TITLE_KEYWORDS = await loadTxt("title_keywords.txt");

    check();
    window.addEventListener("load", check);
    setTimeout(check, 1000);
})();
