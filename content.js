// content.js

const pathnameIs = regex => new RegExp(regex, "i").test(location.pathname);

if(pathnameIs("/users/.+/") && document.querySelector("#profile-data")) { // If this is a valid user profile
  const owner = document.querySelector("#profile-data > div.box-head > div.header-text > h2").innerText.replace("*", "");
  chrome.runtime.sendMessage({type: "RUN_INDEXER"}); // Ask the background script to run the indexer
}