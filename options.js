async function getAvailableModels(apiKey) {
  const response = await fetch(`https://api.openai.com/v1/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const chatGptVersionSelect = document.getElementById('chatGptVersion');

  chrome.storage.sync.get(['apiKey', 'chatGptVersion'], function(data) {
    apiKeyInput.value = data.apiKey || '';
    chatGptVersionSelect.value = data.chatGptVersion || 'gpt-3.5-turbo';
  });

  document.getElementById('save').addEventListener('click', async function() {
    const apiKey = apiKeyInput.value;
    const chatGptVersion = chatGptVersionSelect.value;
    chrome.storage.sync.set({ apiKey, chatGptVersion }, function() {
      console.log('Options saved.');
    });

    const models = await getAvailableModels(apiKey);
    chatGptVersionSelect.innerHTML = '';
    models.data.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.id;
      chatGptVersionSelect.appendChild(option);
    });
  });

  apiKeyInput.addEventListener('input', async () => {
    const apiKey = apiKeyInput.value;
    if (apiKey) {
      const models = await getAvailableModels(apiKey);
      chatGptVersionSelect.innerHTML = '';
      models.data.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.id;
        chatGptVersionSelect.appendChild(option);
      });
    }
  });
});