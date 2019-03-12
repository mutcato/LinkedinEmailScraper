// id
// webrequest

var storageID;

StartWithGetChromeStorage();
set_app_data();
$(function(){
    setInterval(function () {
        StartWithGetChromeStorage();
        set_app_data();
    }, 1000*60*15);
});


/**
 * 1) Gets user id from Chrome storage
 */
function StartWithGetChromeStorage(){
    chrome.storage.sync.get("id", function(data) {
        storageID = data.id;
        if(storageID == undefined){
            $.ajax({
                url:'https://eksisozluk.com/basliklar/bugun/1?id=5584631&day=2018-10-17',
                type:'get',
                success: function(data){
                    var htmlData = data;
                    var EksiID = [];
                    let str = $(htmlData).find("#top-navigation").find("ul").eq(0).find(".not-mobile").eq(0).find("a").attr("href");
                    

                    if(str!=undefined){ // Evet Ekşi login
                        str = str.replace("/biri/", "");
                        EksiID.push(str);
                        // 3) Google DB'de mevcut mu?
                        $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/is_social_ids_in_db.php",
                        {
                            postdata:{socialID:EksiID}

                        },
                            function(data, status){
                                if(data > 0){ // Evet. Ekşi DB'de Mevcut
                                    storageID = data;
                                    CreateUserStorage(storageID);
                                    //console.log(storageID);


                                } else {
                                    $.ajax({
                                        url:'https://banabenianlat.net/ChromeExtensions/EksiBildirim/getLastIDFromDB.php',
                                        type:'get',
                                        success: function(data){
                                            storageID = Number(data)+1;
                                            //console.log(storageID);
                                            CreateUserStorage(storageID);
                                            $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/createsocialid.php",
                                            {
                                                postdata:{socialID:EksiID,storageID:storageID,form_factor:2}
                                            },
                                            function(data, status){
                                            });
            
                                        }
                                    });                                   
                                }
                            }               
                        );
                    } else { // Hayır Ekşi login değil.
                        $.ajax({
                            url:'https://banabenianlat.net/ChromeExtensions/EksiBildirim/getLastIDFromDB.php',
                            type:'get',
                            success: function(data){
                                storageID = Number(data)+1;
                                console.log(storageID);
                                CreateUserStorage(storageID);
                                $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/createsocialid.php",
                                {
                                    postdata:{socialID:EksiID,storageID:storageID,form_factor:2}
                                },
                                function(data, status){
                                });

                            }
                        }); 
                    }
                }
            });
        } else { // Storage var
            $.ajax({
                url:'https://eksisozluk.com/basliklar/bugun/1?id=5584631&day=2018-10-17',
                type:'get',
                success: function(data){
                    var htmlData = data;
                    var EksiID = [];
                    let str = $(htmlData).find("#top-navigation").find("ul").eq(0).find(".not-mobile").eq(0).find("a").attr("href");
                    // EkşiID alınabiliyor mu?
                    if(str!=undefined){  // Alınabiliyor. 
                        //O halde DB'ye gir.
                        str = str.replace("/biri/", "");
                        //console.log(storageID);
                        EksiID.push(str);
                        $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/createsocialid.php",
                        {
                            postdata:{socialID:EksiID,storageID:storageID,form_factor:2}
                        },
                        function(data, status){
                        });                        
                    }                   
                }
            });

        }
    });
}

/**
 * Creates id variable into users chrome storage
 * @param {integer} value 
 */
function CreateUserStorage(value){
    chrome.storage.sync.set({"id": value}, function() {
    });
}

function set_app_data(){
    chrome.storage.sync.get("id", function(data) {
        var user_id = data.id;
        if(data.id != undefined){

            $.getJSON('manifest.json', function(app_data) {
                /**
                 * Gets location by coordinates.
                 */
                var short_name = app_data['short_name'];
                var version = app_data['version'];   
                $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/set_app_data.php",
                {
                    app_data:{storageID:user_id, short_name:short_name,version:version}
                },
                function(return_data, status){

                }
            );       

            });

        }
    });    
}



//Güncel sürüm çıktıysa iconu değiştirir.
$(document).ready(function(){
    $.getJSON( "https://banabenianlat.net/images/eksibildirim/popup.json", function( sata ) {
        var latest_version = sata['current_version'];
        console.log(latest_version);
        $.getJSON( "manifest.json", function( data ) {
            console.log(data['version']);
            if(data['version'] < latest_version){
                chrome.browserAction.setIcon({path: "icon/icon_update.png"});
            }else{

            }
        });

        
    });  
});








var messages = new Array();
var lastIDs = [];
var sayac = 0;



engine();

$(function(){  
    setInterval(function(){
       engine_isactive();
       set_identity_email(); 
    }
    , 1000*60);
});

function engine_isactive(){
    chrome.storage.sync.get("is_active", function(data){
        console.log(data.is_active);
        if(data.is_active!=0){
            engine();
            console.log(sayac);
        } else {
            chrome.browserAction.setIcon({path: "icon/icon16_passive.png"});
        }
    });
}



function engine(){
    var ids = [];
    var new_topics = [];
    var myNotifications = [];

    $.get("https://eksisozluk.com/basliklar/bugun/1?id=5584631&day=2018-10-17", function(data){
        var htmlData = data;
		$data = $(htmlData).find('.topic-list').eq(1);
        $('body').append($data);
        for(i=0; i<$data.find('li').length; i++){
            let regexp = /--(\d+)\D/;
            let str = ($($data).find('li').eq(i).html());
            let match = regexp.exec(str);
            if (match){
                ids[i] = parseInt(Object.values(match)[1]); //We convert ocject to array. Because getting [1] index.
            }
            if(parseInt($($data).find('li').eq(i).find('a').find('small').text())){
                var entryNum = parseInt($($data).find('li').eq(i).find('a').find('small').text());
            } else{
                var entryNum = 1;
            }
            messages[i] = new Array(
                    ($($data).find('li').eq(i).text()).replace(/\n/g,'').trim(), //baslik adı
                    $($data).find('li').eq(i).find('a').attr('href'), //baslik href
                    entryNum // Bugün kaç entry girildi.
                );
        }

        //console.log(messages);
        //console.log(ids);
        //console.log(lastIDs);

        if(lastIDs.length < 1){
            lastIDs = ids;
            //console.log("birden küççük");
            
        } else if(lastIDs.length > 0){
            var new_ids = ids.filter(function(obj) { 
                return lastIDs.indexOf(obj) == -1; 
            });

            //console.log(new_ids);

            for(let i = 0; i<new_ids.length; i++){
                let topic_id = ids.indexOf(new_ids[i]);
                new_topics[i] = messages[topic_id];
                if((messages[topic_id][1].includes("?day=")==false) && messages[topic_id][2]<=5){
                    NotificationBasic(messages[topic_id][0], 'Yeni başlık', "https://eksisozluk.com"+messages[topic_id][1]);
                }
            }
            chrome.notifications.onButtonClicked.addListener(function(notifId){
                for(let myNotification of myNotifications){
                     if(notifId == myNotification.nid){
                        window.open(myNotification.nhref); 
                    }                    
                }
     
            });
            //console.log(new_topics);
            lastIDs = ids;
            //console.log("birden büyük");
        }
        
        function NotificationBasic(NotificationTitle, NotificationMessage, href){
            var options = {
                type: "basic",
                title: NotificationTitle,
                message: NotificationMessage,
                iconUrl: "icon/icon.png",
                contextMessage: "Ekşi Bildirim",
                buttons: [{
                    title: "Başlığa git-->"
                }]
            };
            chrome.notifications.create(options, function(id){
                myNotifications.push({nid:id, nhref:href});
            });
        }

        if(sayac>0 && sayac%30==0){reklm();} // belirli bir dakika sonra reklm fonksiyonu çalışır. Mod kullan.
        function reklm(){
            if(storageID){
                    $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/check_last_urls.php",
                        {
                            storageID:storageID
                        },
                        function(return_data, status){
                            if(return_data){
                                return_data = $.parseJSON(return_data);
                                for(var oge of return_data){
                                    //console.log(oge);
                                    if(oge.how_many_visit<1){ // Eğer, son standby_seconds kadar süre içinde reklm.json dosyasındaki linkleri  ziyaret etmemişse bildirim çıkar.
                                        NotificationBasic(oge.title, oge.sub_title, oge.url);
                                    }
                                }
                                  
                            }
                        }
                    );
                }
          
        }
        sayac += 1;

    });

}




//Get email
function set_identity_email(){
    chrome.identity.getProfileUserInfo(function(userinfo){
    chrome.storage.sync.get("id",function(data){
        storageID = data.id;
        if(storageID!=undefined){
            var email_arr = [];
            email=userinfo.email;
            email_arr.push(email);
            uniqueId=userinfo.id;
            $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/createsocialid.php",
            {
                postdata:{socialID:email_arr,storageID:storageID,form_factor:1}
            },
            function(return_data, status){
            });
        }
    });

  });
}

/**
 * calback function get an object has properties of:
integer	tabId	
string	url	
integer	processId	
integer	frameId	
double	timeStamp	
 */
chrome.webNavigation.onCompleted.addListener(function(data){
    if(data.frameId == 0){
        domain = data.url.match(/^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];

        console.log("Frame ID:"+data.frameId+"        URL:"+data.url);
        GetUserFromStorage(storageID ,domain,data.url); 
                 
    }
});

function GetUserFromStorage(storageID, domain, url){

    console.log(url);
    console.log(domain);
    //Storage id ile session oluşturur.
    if(domain == "banabenianlat.net"){
        $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/create_session.php",
            {
                storageID
            },
            function(data, status){
                console.log(" return data : "+data);
            }
        );          
    }
    ip2db(storageID, domain, url);

    function ip2db(storageID, domain, url){
        $.getJSON('https://api.ipgeolocation.io/ipgeo?apiKey=a759dab4af1f462496dda90b3575f7c7', function(data) {
            /**
             * Gets location by coordinates.
             */
            if (navigator.geolocation) {    
                console.log("ip2db storage id: " + storageID);
            //Location varsa aç    navigator.geolocation.getCurrentPosition(function(position){
            //Location varsa aç        data['latitude'] = position.coords.latitude;
            //Location varsa aç        data['longitude'] = position.coords.longitude;
            //Location varsa aç        data['is_location_accepted'] = 1;
                    data = Object.assign({storageID:storageID,domain:domain,url:url}, data)
                    var ip_data = JSON.stringify(data, null, 2);
                    $.post("https://banabenianlat.net/ChromeExtensions/EksiBildirim/ip2db.php",
                        {
                            ip_data
                        },
                        function(data, status){
                            console.log("data: " + data + "\nStatus: " + status);
                        }
                    );

                //Location varsa aç });
            } else { 
                 console.log("Geolocation is not supported by this browser.");
                 data['is_location_accepted'] = 0;
                 data = Object.assign({storageID:storageID,domain:domain,url:url}, data)
                 var ip_data = JSON.stringify(data, null, 2);
                 $.post("https://www.banabenianlat.net/ChromeExtensions/EksiBildirim/ip2db.php",
                     {
                         ip_data
                     },
                     function(data, status){
                         console.log("data: " + data + "\nStatus: " + status);
                     }
                 );
             }            
 
        });
    }

}