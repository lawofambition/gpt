document.getElementById("editBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const prompt = document.getElementById("prompt").value;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: sendPromptToContent,
    args: [prompt]
  });
});

function sendPromptToContent(prompt) {
  window.postMessage({ type: "MILAN_GPT_PROMPT", prompt }, "*");
}