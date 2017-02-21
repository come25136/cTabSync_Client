var socketio = io.connect("wss://ctabsync.momizi.work");
var twitterid;

$.ajax({
  url: "https://twitter.com/",
  type: "GET",
  success: function (data) {
    twitterid = $(data).find("#page-container > div.dashboard.dashboard-left > div.DashboardProfileCard.module > div > div.DashboardProfileCard-userFields > span > a > span").text();

    connected();
  }
});

socketio.on("reconntcted", connected());
socketio.on("pull", push());

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { if (tab.status === 'complete') push(); });
chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) { push(); });

function connected() {
  getAllTab(function (tabs) {
    socketio.emit("connected", { 'name': twitterid, 'tabs': tabs });
  });
}

function push() {
  getAllTab(function (tabs) {
    socketio.emit("push", { "tabs": tabs });
  });
};

function getAllTab(f) {
  chrome.windows.getAll({ populate: true }, function (windows) {
    var tabs = [];
    windows.forEach(function (window) {
      window.tabs.forEach(function (tab) {
        if (!tab.url.match(/^(chrome:\/\/|vivaldi:\/\/|chrome-extension:\/\/)/)) {
          tabs.push([tab.title, tab.url, tab.favIconUrl]);
        }
      });
    });
    f(tabs);
  });
}