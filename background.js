chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ apiKey: '', chatGptVersion: 'gpt-3.5-turbo' });
  console.log('Default API Key and ChatGPT version set.');
});

async function fetchChatGptResponse(apiKey, model, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  });
  return response.json();
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'sendToChatGpt') {
    const { apiKey, model, messages } = request;
    try {
      const response = await fetchChatGptResponse(apiKey, model, messages);
      sendResponse({ success: true, response });
    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Indicates that the response is asynchronous
  }
});