"use strict";

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ level: 0 });
});

window.onload = function () {
    var user = undefined;

    chrome.storage.sync.get("userkey", function(data) {
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
        if ("userkey" in changes) {
            init(changes.userkey.newValue);
        }

        if ("furiganaOff" in changes) {
            setState(changes.furiganaOff.newValue);
        }
    });

    chrome.runtime.onMessage.addListener(function (msg, sender, response) {
        if (msg.from === "content" && msg.subject === "kanji") {
            response(user.kanji.getByCharacter(msg.character));
        }
    });

    function init(userkey) {
        console.log("using userkey: " + userkey);
        user = wanikani.getUser(userkey);
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
            chrome.tabs.query({ currentWindow: true, active: true }, function (info) {
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
        chrome.tabs.sendMessage(id, { from: "background", subject: "toggle" });
    }
}