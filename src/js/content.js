chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if (msg.from === "background" && msg.subject === "toggle") {
        toggle();
    }
    if (msg.from === "popup" && msg.subject === "levelChange" && msg.on) {
        recalculate();
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

let nodes = undefined;
let level = -1;
let kanjiColor = "#0000ff";
let furiganaColor = "#ff0000";
let keys = [];

function parseData() {
    let rubies = document.getElementsByTagName("ruby");
    nodes = [];

    for (var index in rubies) {
        if (rubies[index].childNodes === undefined) {
            // console.log("skipping 1");
            // console.dir(rubies[index]);
            continue;
        }
        if (rubies[index].childNodes.length < 2) {
            // console.log("skipping 2");
            // console.dir(rubies[index]);
            continue;
        }

        let wordNode = rubies[index].firstChild;
        let nodeName = wordNode.nodeName.toLowerCase();
        let kanjiText = undefined;

        if (nodeName === "#text") {
            kanjiText = wordNode.data;
        } else if (nodeName === "span") {
            kanjiText = wordNode.innerHTML;
        } else {
            console.log("unhandled type: " + nodeName);
            console.dir(wordNode);
        }

        let rtNode = wordNode.nextSibling;
        //let hiraganaText = rtNode.innerHTML;
        if (nodes[kanjiText] !== undefined) {
            nodes[kanjiText].rubies.push(rubies[index]);
            nodes[kanjiText].rts.push(rtNode);
        } else {
            nodes[kanjiText] = {
                rubies: [rubies[index]],
                rts: [rtNode]
            }
            keys.push(kanjiText);
        }
    }

    recalculate();
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

    for (var index in nodes) {
        let rubies = nodes[index].rubies;

        for (var i = 0; i < rubies.length; i++) {
            rubies[i].classList.remove("furigana-toggle");
        }
    }
}

/*
 *  Recalculates whether each node should be hidden
 */
function recalculate() {
    chrome.runtime.sendMessage({
        from: "content",
        subject: "kanji",
        keys: keys
    }, function (response) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            return;
        }

        let data = response;
        if (data !== null && data !== undefined) {
            for (var key in data) {
                if (data[key]) {
                    for (var i = 0; i < nodes[key].rubies.length; i++) {
                        nodes[key].rubies[i].classList.add("furigana-toggle");
                    }
                } else {
                    for (var i = 0; i < nodes[key].rubies.length; i++) {
                        nodes[key].rubies[i].classList.remove("furigana-toggle");
                    }
                }
            }

            hideFurigana();
        }
    });
}