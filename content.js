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

let URL_KEYWORDS = [];
let TITLE_KEYWORDS = [];

async function loadKeywords() {
    const { urlKeywords = [], titleKeywords = [] } =
        await chrome.storage.local.get(["urlKeywords", "titleKeywords"]);
    URL_KEYWORDS = urlKeywords;
    TITLE_KEYWORDS = titleKeywords;
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.urlKeywords) URL_KEYWORDS = changes.urlKeywords.newValue || [];
    if (changes.titleKeywords) TITLE_KEYWORDS = changes.titleKeywords.newValue || [];
});

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
    await loadKeywords();

    check();
    window.addEventListener("load", check);
    setTimeout(check, 1000);
})();
