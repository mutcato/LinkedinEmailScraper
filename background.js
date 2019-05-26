console.log("heyy i am background.js")

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      // read changeInfo data and do something with it
      // like send the new url to contentscripts.js
      if (changeInfo.url) {
        console.log(changeInfo.url);
        if(changeInfo.url.includes("linkedin.com/search/results/people/")){
          var message = "connection list!";
        } else {
          var message = "profile clicked!"
        }
        chrome.tabs.sendMessage( tabId, {
          message: message,
          url: changeInfo.url
        });
      }
    }
  );