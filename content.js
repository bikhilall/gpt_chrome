function getPageData() {
  const pageContent = document.body.innerText;
  const actionableElements = Array.from(document.querySelectorAll('a, button, input, select, textarea'))
    .map((element, index) => ({ id: element.id || `element-${index}`, tagName: element.tagName }));
  return { pageContent, actionableElements };
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getPageData') {
    const pageData = getPageData();
    sendResponse(pageData);
  }
  if (request.action === 'highlightElements') {
    highlightElements(request.ids);
  } else if (request.action === 'fillForms') {
    fillForms(request.formsToFill);
  } else if (request.action === 'clickElement') {
    clickElement(request.elementId);
  } else if (request.action === 'openUrl') {
    openUrl(request.url);
  }
  return true; // Keep the message channel open for asynchronous response
});

function highlightElements(ids) {
  ids.forEach(id => {
    const element = document.getElementById(id) || document.querySelector(`[name=${id}]`);
    if (element) {
      element.classList.add('highlighted-element');
    }
  });
}

function fillForms(formsToFill) {
  for (const id in formsToFill) {
    const element = document.getElementById(id) || document.querySelector(`[name=${id}]`);
    if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
      element.value = formsToFill[id];
    }
  }
}

function clickElement(elementId) {
  const element = document.getElementById(elementId) || document.querySelector(`[name=${elementId}]`);
  if (element) {
    element.click();
  }
}

function openUrl(url) {
  window.location.href = url;
}
