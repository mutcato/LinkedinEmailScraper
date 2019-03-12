console.log("content matched");

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

let art_deco = document.getElementsByClassName("artdeco-card");
function get_connections(){
    let list_items = $("li.list-style-none .mn-connection-card__picture").map( function() {
        return $(this).attr('href');
    }).get();
    return list_items;
}
console.log(get_connections());

$(window).scroll(function () {
    if ($(document).height()*0.9 <= $(window).scrollTop() + $(window).height()) {
        console.log(get_connections());
    }
});