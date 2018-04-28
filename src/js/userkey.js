"use strict";

window.onload = function () {
    let text = document.getElementById("userkey");
    let submitButton = document.getElementById("submitButton");
    var key = "";

    submitButton.onclick = onSubmit;

    function onSubmit() {
        key = text.value;
        if (key !== "") {
            chrome.runtime.sendMessage({ from: "userkey", subject: "userkey", userkey: key }, function(response) {
                chrome.tabs.getCurrent(function(tab) {
                    chrome.tabs.remove(tab.id);
                });
            });
        }
    }
}