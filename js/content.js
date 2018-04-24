chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if (msg.from === "background" && msg.subject === "toggle") {
        toggle();
    }
});

function toggle() {
    chrome.storage.sync.get({
        furiganaOff: false,
        hoverReveal: true,
        colour: false,
        kanjiColor: "#0000ff",
        furiganaColor: "#ff0000",
        level: 0
    }, function (items) {
        if (items.hoverReveal) {
            document.body.classList.add("furigana-toggle-hover");
        } else {
            document.body.classList.remove("furigana-toggle-hover");
        }

        if (items.hoverReveal && items.color) {
            document.body.classList.add("furigana-toggle-color");
        } else {
            document.body.classList.remove("furigana-toggle-color");
        }

        if (items.furiganaOff) {
            level = items.level;
            kanjiColor = items.kanjiColor;
            furiganaColor = items.furiganaColor;

            parseData();
        } else {
            showFurigana();
        }
    });
}

var nodes = undefined;
var level = -1;
var kanjiColor = "#0000ff";
var furiganaColor = "#ff0000";

function parseData() {
    let rubies = document.getElementsByTagName("ruby");
    nodes = [];

    for (index in rubies) {
        let wordNode = rubies[index].firstChild;

        if (wordNode === undefined) {
            continue;
        }

        let rtNode = wordNode.nextSibling;

        let kanjiText = wordNode.data;
        //let hiraganaText = rtNode.innerHTML;
        nodes.push({
            ruby: rubies[index],
            rt: rtNode,
            kanjis: kanjiText.split(""),
            //hiragana: hiraganaText,
            count: 0
        });
    }

    for (index = 0; index < nodes.length; index++) {
        for (i = 0; i < nodes[index].kanjis.length; i++) {
            let r = index;
            let k = nodes[r].kanjis[i];

            chrome.runtime.sendMessage({ from: "content", subject: "kanji", character: k }, function(response) {
                if (response !== null) {
                    // console.log(k + " === " + response.user_specific.srs);
    
                    if (getSrsLevel(response.user_specific.srs) >= level) {
                        nodes[r].count++;
                    }
    
                    if (nodes[r].count == nodes[r].kanjis.length) {
                        nodes[r].ruby.classList.add("furigana-toggle");
                    }
                } else {
                    // console.log(k);
                }
    
                if (r == nodes.length - 1) {
                    hideFurigana();
                }
            });
        }
    };
}

function hideFurigana() {
    if (hasStyle()) {
        return;
    }

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = chrome.extension.getURL("css/furigana-toggle.css");
    stylesheet.id = "furigana-toggle-css";
    document.head.appendChild(stylesheet);

    setColor();
}

function setColor() {
    document.getElementsByTagName("body")[0].style.setProperty("--kanji-color", kanjiColor);
    document.getElementsByTagName("body")[0].style.setProperty("--furigana-color", furiganaColor);
}

function hasStyle() {
    return Boolean(document.getElementById("furigana-toggle-css"));
}

function showFurigana() {
    document.body.classList.remove("furigana-toggle-hover");
    document.body.classList.remove("furigana-toggle-color");

    for (index in nodes) {
        nodes[index].ruby.classList.remove("furigana-toggle");
    }
}

function getSrsLevel(srs) {
    switch (srs) {
        case "apprentice": return 0;
        case "guru": return 1;
        case "master": return 2;
        case "enlighten": return 3;
        case "burned": return 4;
        default: return -1;
    }
}