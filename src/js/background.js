"use strict";

let user = undefined;

function showUserkeyPage() {
    chrome.tabs.create({
        url: chrome.extension.getURL("userkey.html")
    })
}

function start() {
    chrome.storage.sync.get("userkey", function(data) {
        // only initialize defaults if we don't already have userkey
        if (data.userkey === undefined) {
            chrome.storage.sync.set({
                level: 0,
                userkey: undefined
            });

            showUserkeyPage();
        } else {
            init(data.userkey);
        }
    });
}

function init(userkey) {
    console.log("using userkey: " + userkey);
    user = new User(userkey);
    user.sync().then(function() {
        console.log("finished user sync");
        console.log(user);
    });

    user.getKanji().then(function (user) {
        console.log(user.kanji);
    }, onError);
}

function onError(info) {
    console.log("error");
    console.dir(info);
}

chrome.runtime.onInstalled.addListener(function () {
    console.log("onInstalled");
    start();
});

chrome.runtime.onStartup.addListener(function() {
    console.log("onStartup");
    start();
});

chrome.runtime.onSuspend.addListener(function () {
    console.log("onSuspend");
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    hideFuriganaForTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    hideFuriganaForTab(tabId);
});

chrome.storage.onChanged.addListener(function (changes) {
    if ("furiganaOff" in changes) {
        setState(changes.furiganaOff.newValue);
    }

    if ("level" in changes) {
        chrome.storage.sync.get("furiganaOff", function(data) {
            chrome.tabs.query({
                currentWindow: true
            }, function (tabs) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                    return;
                }

                for (var i in tabs) {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        from: "popup",
                        subject: "levelChange",
                        on: data.furiganaOff
                    });
                }
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if (msg.from === "userkey" && msg.subject === "userkey") {
        chrome.storage.sync.set({
            "userkey": msg.userkey
        }, function () {
            init(msg.userkey);
            response();
        });

        return true;
    }

    if (msg.from === "content" && msg.subject === "kanji") {
        let data = {};

        chrome.storage.sync.get("level", function (obj) {
            let keys = msg.keys;

            for (var index in keys) {
                let key = keys[index];
                // console.log("checking " + key);
                let parts = key.split("");
                let shouldHide = true;

                for (var i = 0; i < parts.length; i++) {
                    if (user.getKanjiLevel(parts[i]) < obj.level) {
                        // console.log("under SRS level " + obj.level + ": " + parts[i]);
                        shouldHide = false;
                        break;
                    }
                }

                data[key] = shouldHide;
                // if (!shouldHide) {
                //     console.log("not hiding '" + key + "'");
                // }
            }

            response(data);
        });

        return true;
    }

    if (msg.from === "popup" && msg.subject === "sync") {
        
    }
});

function setState(on) {
    chrome.storage.sync.set({
        "furiganaOff": on
    });

    const badgeText = on ? "ON" : "";
    chrome.browserAction.setBadgeText({
        text: badgeText
    });

    if (on) {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function (info) {
            hideFuriganaForTab(info[0].id);
        });
    } else {
        showFuriganaAllTabs();
    }
}

function showFuriganaAllTabs() {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        tabs.forEach(function (tab) {
            hideFuriganaForTab(tab.id);
        });
    });
}

function hideFuriganaForTab(id) {
    chrome.tabs.sendMessage(id, {
        from: "background",
        subject: "toggle"
    });
}
