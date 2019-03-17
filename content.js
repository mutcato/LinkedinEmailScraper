console.log("content matched");

function get_names(){
    let art_deco = document.getElementsByClassName("artdeco-card");
    let names = $(".mn-connection-card__name").map( function() {
        return $(this).text().trim();
    }).get();
    return names;
}

function get_usernames(){
    let art_deco = document.getElementsByClassName("artdeco-card");
    let usernames = $("li.list-style-none .mn-connection-card__picture").map( function() {
        let href = $(this).attr('href');
        return href.substring(href.lastIndexOf("/in/") + 4, href.lastIndexOf("/"));
    }).get();
    return usernames;
}

function get_connections(usernames){
    /**
     * 
     * @param {array} usernames 
     * @return {array} emails
     */
    let names = get_names();
    let connections = [];
    for (let i=0; i<usernames.length; i++){
        // Get email addresses
        $.ajax({ 
            url: 'https://www.linkedin.com/in/'+usernames[i]+'/detail/contact-info/', 
            success: function(data) {
                $htmlData = data;
                $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
                connections.push({name: names[i], email: $email[0], username: usernames[i]}); 
            } });

    }
    return connections;
}

let usernames = get_usernames();
let connections = get_connections(usernames);

//make room for salaries section
$(".mn-connection-card").css("margin-left", "100px");

console.log(connections);
//list_items'i db'ye kaydet.

/*
var controll = 1; 
$(window).scroll(function () {
        let usernames = get_usernames();
        //Her scrollda get_connections() fonksiyonunun çalışması hesabı kitliyor.
        //let new_list = get_connections(usernames);
        console.log("new List:");
        console.log(new_list.length);
        console.log("List Items:");
        console.log(list_items.length);  
        $(".mn-connection-card").css("margin-left", "100px");

        if(new_list > list_items){
                controll = 0;
                // pick connections is in new_list but not in list_items(old list)
                let difference_list = new_list.filter(x => !list_items.includes(x));
                //difference_list'i db'ye kaydet.
                list_items = new_list;
                console.log(difference_list);                

        }else{
                console.log("pop");
                controll = 1;
                //çıkanların profil ücret işlemelerini yap                

        }
        
});
*/
