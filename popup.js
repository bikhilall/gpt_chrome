document.getElementById('submitCommand').addEventListener('click', function() {
  const command = document.getElementById('commandInput').value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getPageData'}, async function(response) {
      if (response) {
        const pageData = response;
        const messages = [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: `This is a web page with the following content:\n${pageData.pageContent}\n\nThe user is asking for the following:\n${command}\n\nRespond in the following json format:\n{responseToUser:"what to tell the user", pageElementsToHighlight:[id,id2], formsToFill:{id:content, id2:content2}, elementToClick: id, urlToOpen:url}\nresponseToUser is required, everything else is optional.`
          }
        ];
        chrome.storage.sync.get(['apiKey', 'chatGptVersion'], async function(data) {
          const apiKey = data.apiKey;
          const model = data.chatGptVersion;
          if (apiKey) {
            try {
              const chatGptResponse = await fetchChatGptResponse(apiKey, model, messages);
              if (chatGptResponse.choices && chatGptResponse.choices.length > 0) {
                const chatResponseContent = JSON.parse(chatGptResponse.choices[0].message.content);
                document.getElementById('responseSection').textContent = chatResponseContent.responseToUser;
                if (chatResponseContent.pageElementsToHighlight) {
                  chrome.tabs.sendMessage(tabs[0].id, {action: 'highlightElements', ids: chatResponseContent.pageElementsToHighlight});
                }
                if (chatResponseContent.formsToFill) {
                  chrome.tabs.sendMessage(tabs[0].id, {action: 'fillForms', formsToFill: chatResponseContent.formsToFill});
                }
                if (chatResponseContent.elementToClick) {
                  chrome.tabs.sendMessage(tabs[0].id, {action: 'clickElement', elementId: chatResponseContent.elementToClick});
                }
                if (chatResponseContent.urlToOpen) {
                  chrome.tabs.sendMessage(tabs[0].id, {action: 'openUrl', url: chatResponseContent.urlToOpen});
                }
              } else {
                document.getElementById('responseSection').textContent = 'Failed to get a valid response from ChatGPT.';
              }
            } catch (error) {
              console.error('Failed to get response from ChatGPT:', error);
              document.getElementById('responseSection').textContent = 'Failed to get response from ChatGPT: ' + error.message;
            }
          } else {
            document.getElementById('responseSection').textContent = 'API Key is not set. Please set it in the options.';
          }
        });
      }
    });
  });
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