console.log("heyy i am background.js")

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      // read changeInfo data and do something with it
      // like send the new url to contentscripts.js
      if (changeInfo.url) {
        console.log(changeInfo.url);
        chrome.tabs.sendMessage( tabId, {
          message: 'url_changed!',
          url: changeInfo.url
        })
      }
    }
  );