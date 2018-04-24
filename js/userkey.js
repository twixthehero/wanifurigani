"use strict";

window.onload = function () {
    let text = document.getElementById("userkey");
    let submitButton = document.getElementById("submitButton");
    var key = "";

    submitButton.onclick = onSubmit;

    function onSubmit() {
        key = text.value;
        if (key !== "") {
            let user = wanikani.getUser(key);
            var info = false;
            var kanji = false;

            user.getInfo().then(function(user) {}, onError, function() {
                console.log("getInfo success");
                console.log(user.info);
                info = true;
            });

            user.getKanji().then(function(user) {
                console.log("getKanji success");
                console.log(user.kanji);
                kanji = true;
            }, onError, function() {
                if (info && kanji) {
                    chrome.storage.sync.set({"userkey": key});
                    chrome.tabs.getCurrent(function(tab) {
                        chrome.tabs.remove(tab.id);
                    });
                } else {
                    console.log("error fetching user data: " + info + " " + kanji);
                }
            });
        }
    }

    function onError(info) {
        console.log("error");
        console.log(info);
    }
}