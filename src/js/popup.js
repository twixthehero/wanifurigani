let changeLevel = document.getElementById("changeLevel");
let image = document.getElementById("image");
let background = document.getElementById("background");
let text = document.getElementById("text");
let onButton = document.getElementById("switch");
let syncButton = document.getElementById("sync");

let levelColors = ["#DD0093", "#882D9E", "#294DDB", "#0093DD", "#434343"];
let levelNames = ["Apprentice", "Guru", "Master", "Enlightened", "Burned"];

function levelUp() {
    chrome.storage.sync.get("level", function (data) {
        var currentLevel = data.level;
        currentLevel = (currentLevel + 1) % 5;
        background.style = "background-color: " + levelColors[currentLevel];
        text.textContent = levelNames[currentLevel];
        image.src = "images/icon" + currentLevel + ".png";
        chrome.storage.sync.set({
            level: currentLevel
        }, function () {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }

            console.log("difficulty level: " + currentLevel);
        });
    });
};

function toggle() {
    chrome.storage.sync.get("furiganaOff", function (data) {
        var on = !data.furiganaOff;
        onButton.textContent = on ? "ON" : "OFF";
        chrome.storage.sync.set({
            "furiganaOff": on
        });
    });
}

function sync() {
    chrome.runtime.sendMessage({
        "from": "popup",
        "subject": "sync"
    }, function() {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            return;
        }
    });
}

changeLevel.onclick = levelUp;
onButton.onclick = toggle;
syncButton.onclick = sync;

chrome.storage.sync.get("level", function (data) {
    background.style = "background-color: " + levelColors[data.level];
    text.textContent = levelNames[data.level];
    image.src = "images/icon" + data.level + ".png";
});

chrome.storage.sync.get("furiganaOff", function (data) {
    onButton.textContent = data.furiganaOff ? "ON" : "OFF";
});