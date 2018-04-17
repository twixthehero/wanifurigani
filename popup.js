let changeLevel = document.getElementById("changeLevel");
let image = document.getElementById("image");
let background = document.getElementById("background");
let text = document.getElementById("text");
let onButton = document.getElementById("switch");

let levelColors = ["#DD0093", "#882D9E", "#294DDB", "#0093DD", "#434343"];
let levelNames = ["Apprentice", "Guru", "Master", "Enlightened", "Burned"];

let infoUrl = "https://www.wanikani.com/api/user/f1a8dbd2ae2e8f07e00aad26f0e60d81/user-information";

function levelUp() {
    chrome.storage.sync.get("level", function (data) {
        var currentLevel = data.level;
        currentLevel = (currentLevel + 1) % 5;
        background.style = "background-color: " + levelColors[currentLevel];
        text.innerHTML = levelNames[currentLevel];
        image.src = "images/icon" + currentLevel + ".png";
        chrome.storage.sync.set({
            "level": currentLevel
        }, function () {
            console.log("difficulty level: " + currentLevel);
        });
    });
};

function toggle() {
    chrome.storage.sync.get("furiganaOff", function (data) {
        var on = !data.furiganaOff;
        onButton.innerHTML = on ? "ON" : "OFF";
        chrome.storage.sync.set({
            "furiganaOff": on
        });
    });
}

changeLevel.onclick = levelUp;
onButton.onclick = toggle;

chrome.storage.sync.get("level", function (data) {
    background.style = "background-color: " + levelColors[data.level];
    text.innerHTML = levelNames[data.level];
    image.src = "images/icon" + data.level + ".png";
});

chrome.storage.sync.get("furiganaOff", function (data) {
    onButton.innerHTML = data.furiganaOff ? "ON" : "OFF";
});