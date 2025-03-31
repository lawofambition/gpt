window.addEventListener("message", async (event) => {
  if (event.source !== window || event.data.type !== "MILAN_GPT_PROMPT") return;

  const prompt = event.data.prompt;
  const pageId = window.location.pathname.replace("/", "").split("-").pop();

  const response = await fetch("https://milan-gpt-api.onrender.com/edit-notion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageId, prompt })
  });

  const result = await response.json();
  alert(result.message || "Notion page updated.");
});

// ---------- background.js ----------
