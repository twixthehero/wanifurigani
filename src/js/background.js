"use strict";

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        level: 0
    });
});

window.onload = function () {
    let user = undefined;

    chrome.storage.sync.get("userkey", function (data) {
        if (data.userkey === undefined) {
            console.log("no userkey found!");
            chrome.tabs.create({
                url: chrome.extension.getURL("userkey.html")
            })
        } else {
            console.log("found userkey");
            init(data.userkey);
        }
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
                        let char = user.kanji.getByCharacter(parts[i]);

                        if (char === undefined) {
                            // console.log("not unlocked: " + parts[i]);
                            shouldHide = false;
                            break;
                        }

                        if (char.data === null || char.data.user_specific === null) {
                            // console.log(char.data);
                            shouldHide = false;
                            break;
                        }

                        if (getSrsLevel(char.data.user_specific.srs) < obj.level) {
                            // console.log("under SRS level " + obj.level + ": " + parts[i]);
                            shouldHide = false;
                            break;
                        }
                    }

                    data[key] = shouldHide;
                    if (!shouldHide) {
                        console.log("not hiding '" + key + "'");
                    }
                }

                response(data);
            });

            return true;
        }
    });

    function init(userkey) {
        console.log("using userkey: " + userkey);
        user = wanikani.getUser(userkey);

        user.getKanji().then(function (user) {
            console.log(user.kanji);
        }, onError);
        user.getVocab().then(function (user) {
            console.log(user.vocabulary);
        }, onError);
    }

    function onError(info) {
        console.log("error");
        console.dir(info);
    }

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
}

function getSrsLevel(srs) {
    switch (srs) {
        case "apprentice":
            return 0;
        case "guru":
            return 1;
        case "master":
            return 2;
        case "enlighten":
            return 3;
        case "burned":
            return 4;
        default:
            return -1;
    }
}