const urlTextarea = document.getElementById("urlKeywords");
const titleTextarea = document.getElementById("titleKeywords");
const statusEl = document.getElementById("status");
const saveButton = document.getElementById("save");

function toLines(text) {
    return text
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

async function load() {
    const { urlKeywords = [], titleKeywords = [] } =
        await chrome.storage.local.get(["urlKeywords", "titleKeywords"]);
    urlTextarea.value = urlKeywords.join("\n");
    titleTextarea.value = titleKeywords.join("\n");
}

async function save() {
    await chrome.storage.local.set({
        urlKeywords: toLines(urlTextarea.value),
        titleKeywords: toLines(titleTextarea.value)
    });
    statusEl.textContent = "保存しました";
    setTimeout(() => { statusEl.textContent = ""; }, 2000);
}

function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function setupExportImport(textarea, exportButtonId, importButtonId, importFileId, filename) {
    document.getElementById(exportButtonId).addEventListener("click", () => {
        downloadText(filename, textarea.value);
    });

    const fileInput = document.getElementById(importFileId);
    document.getElementById(importButtonId).addEventListener("click", () => {
        fileInput.click();
    });
    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;
        textarea.value = toLines(await readFile(file)).join("\n");
        fileInput.value = "";
    });
}

setupExportImport(urlTextarea, "exportUrl", "importUrl", "importUrlFile", "url_keywords.txt");
setupExportImport(titleTextarea, "exportTitle", "importTitle", "importTitleFile", "title_keywords.txt");

saveButton.addEventListener("click", save);
load();
