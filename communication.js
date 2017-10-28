// This file allows us to communicate with content.js. We'll use a switch statement
// to find out what content.js wants us to do, and then send it a response with
// sendResponse(...)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.type) {
    case "RUN_INDEXER":
		index(chrome.storage.sync, {topicID: TOPIC_ID}).then(sendResponse);
		break;
  }
  return true; // This allows us to asynchronously respond
});