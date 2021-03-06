let sourceId = '';

function cancelDefault(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
}

function getDataId(event) {
  if (event.currentTarget.id === 'tab' || event.currentTarget.className === 'breadcrumb') {
    return event.currentTarget.dataset.id;
  } else {
    return;
  }
}

/* EVENT HANDLER */

function message(message) {
  webviewApi.postMessage({ name: message });
}

function openLink(event, message) {
  webviewApi.postMessage({ name: message, value: event.currentTarget.dataset.value });
}
