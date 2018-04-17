"use strict";

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        "level": 1
    }, function () {
        console.log("difficulty level: " + 1);
    });
});

let on = false;

chrome.tabs.onActivated.addListener(function (activeInfo) {
    applyStylesheetToTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    applyStylesheetToTab(tabId);

    if (changeInfo.url != null &&
        changeInfo.url.startsWith("https://www.wanikani.com")) {
        
    }
});

chrome.storage.onChanged.addListener(function (changes) {
    console.log("changed");
    if ('furiganaOff' in changes) {
        on = !on;
    
        setBadgeText();
    
        if (on) {
            applyStylesheetToTab(undefined);
        }

        if (changes.furiganaOff.newValue === false) {
            applyStylesheetToAllTabs();
        }
    }
});

function setBadgeText() {
    chrome.storage.sync.set({
        'furiganaOff': on
    });
    const badgeText = on ? 'ON' : '';
    chrome.browserAction.setBadgeText({
        text: badgeText
    });
}

function applyStylesheetToAllTabs() {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        tabs.forEach(function (tab) {
            applyStylesheetToTab(tab.id);
        });
    });
}

function applyStylesheetToTab(id) {
    chrome.tabs.executeScript(id, {
        file: 'content.js'
    }, function () {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
        }
    });
}