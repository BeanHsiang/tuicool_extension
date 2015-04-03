var articleData = chrome.extension.getBackgroundPage().articles;
chrome.extension.getBackgroundPage().updatedCount = 0;
chrome.browserAction.setBadgeText({text: ""});

Vue.filter('nowtime', function (value) {
    var padding = function (num) {
        if(String(num).length == 1){
            return '0' + num;
        }
        return num;
    };
    var show = new Date(value);
    var result = [];
    result.push(show.getFullYear());
    result.push("-");
    result.push(padding(show.getMonth() + 1));
    result.push("-");
    result.push(padding(show.getDate()));
    result.push(" ");
    result.push(padding(show.getHours()));
    result.push(":");
    result.push(padding(show.getMinutes()));
    return result.join('');
});

var app = new Vue({
    el: "#articles",
    data: {
        articles: articleData,
        show: function(url) {
            chrome.tabs.create({ url: url,selected: false });
        }
    }
});

chrome.notifications.getAll(function (ids) {
    for (var i in ids) {
        chrome.notifications.clear(i, function () {});
    }
});
