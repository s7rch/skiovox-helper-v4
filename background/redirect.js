const targetUrl = "https://google.com/";
const redirectPage = chrome.runtime.getURL("new-tab/main.html");

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    return { redirectUrl: redirectPage };
  },
  { urls: [targetUrl] },
  ["blocking"]
);
