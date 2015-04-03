chrome.browserAction.setBadgeBackgroundColor({color:[25, 135, 0, 250]});
var TUICOOL_STORAGE_KEY = "tuicool_storage";
var HOME_PAGE = "http://www.tuicool.com/a/";
var DOMAIN = "http://www.tuicool.com";
var year = (new Date()).getFullYear();
var lastId = "";
var articles = [];
var updatedCount = 0;

function requestArticles() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            analyseArticles(request.responseText);            
        }
    }
    request.open("GET", HOME_PAGE + "?stick=" + Math.random(), true);
    request.send();
    setTimeout(requestArticles, 120000);
}


function analyseArticles(response) {
    var doc = document.implementation.createHTMLDocument("tuicool");
    doc.documentElement.innerHTML = response;
    var listDiv = doc.querySelector("#list_article");
    var articlesDiv = listDiv.querySelectorAll(".single_fake");
    articles = [];
    var currentUpdatedCount = 0;
    var stop = false;
    for (var i = 0, len = articlesDiv.length; i < len; i++) {
        try {
                var article = {};
                article.id = articlesDiv[i].getAttribute("data-id");
                // article.isNew = false;

                if (lastId === article.id) {
                    stop = true;
                } else if (!stop) {
                    // article.isNew = true;
                    currentUpdatedCount++;
                }


                var single = articlesDiv[i].querySelector(".article_title a");
                article.url = DOMAIN + single.getAttribute("href");
                article.title = single.getAttribute("title");
                article.content = articlesDiv[i].querySelector(".article_cut").firstChild.nodeValue;
                if (articlesDiv[i].querySelector(".article_thumb")) {
                    article.img = articlesDiv[i].querySelector(".article_thumb img").getAttribute("src");
                } else {
                    article.img = "";
                }
                article.source = articlesDiv[i].querySelectorAll(".tip span")[0].lastChild.nodeValue;
                article.publishTime = new Date(year + " " + articlesDiv[i].querySelectorAll(".tip span")[1].lastChild.nodeValue);
                articles.push(article);
        } catch(e) {
            alert(e.message);
        }
    }


    if (articles.length > 0) {
        updatedCount += currentUpdatedCount;
        updatedCount = updatedCount > articles.length ? articles.length : updatedCount;
        if (updatedCount != 0) {
            chrome.browserAction.setBadgeText({text: String(updatedCount)});
        }        
        var notifyCount = currentUpdatedCount > 3 ? 3 : currentUpdatedCount;
        for (var i = 0; i < notifyCount; i++) {
            var notifyArticle = articles[i];
            
            var opt = {
                type: "basic",
                title: "推酷最新文章",
                iconUrl: "../icon/logo.png",
                message: notifyArticle.title,
                isClickable: true
            };
            chrome.notifications.create(notifyArticle.id, opt, function(id) {                
                
            });
        }
        lastId = articles[0].id;
    }    
}

chrome.notifications.onClicked.addListener(function (id) {
    for (var i = 0,len = articles.length; i < len; i++) {
        if(articles[i].id == id) {
            chrome.tabs.create({ url: articles[i].url,selected: false }, function(tab) {
                updatedCount--;
                if(updatedCount > 0) {
                    chrome.browserAction.setBadgeText({text: String(updatedCount)});
                } else {
                    chrome.browserAction.setBadgeText({text: ""});
                }
                
            });
            break;
        }
    }
});

requestArticles();
