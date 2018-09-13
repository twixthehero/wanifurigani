"use strict";

const URL_BASE = "https://www.wanikani.com/api/user/";

const HttpClient = class {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    get(rest) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        resolve(request.responseText);
                    } else {
                        reject(request.statusText);
                    }
                }
            };

            request.open("GET", this.baseUrl + rest, true);
            request.send();
        });
    }
};

const User = class {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = new HttpClient(URL_BASE);
        this.lastSync = new Date().getTime();
    }

    checkOutdated() {
        return new Date().getTime() - this.lastSync >= 60 * 60 * 2; // 2 hours
    }

    sync() {
        this.kanji = {};
        this.vocab = {};

        return this._syncKanji().then(this._syncVocab());
    }

    _syncKanji() {
        this.kanji = {};

        return this.client.get(this.apiKey + "/kanji").then((function(response) {
            console.log("got kanji");
            var json = JSON.parse(response);
            var data = json.requested_information;
            for (var i = 0; i < data.length; i++) {
                // if they've unlocked this kanji
                if (data[i].user_specific !== null) {
                    this.kanji[data[i].character] = new Kanji(data[i]);
                }
            }
        }).bind(this), function(code, msg) {
            console.log(code + ": " + msg);
        });
    }

    _syncVocab() {
        this.vocab = {};

        return this.client.get(this.apiKey + "/vocabulary").then((function(response) {
            console.log("got vocab");
            var json = JSON.parse(response);
            var data = json.requested_information.general;
            for (var i = 0; i < data.length; i++) {
                // if they've unlocked this vocab
                if (data[i].user_specific !== null) {
                    this.vocab[data[i].character] = new Vocab(data[i]);
                }
            }
            this.lastSync = new Date().getTime();
        }).bind(this), function(code, msg) {
            console.log(code + ": " + msg);
        });
    }

    getKanjiLevel(k) {
        if (this.kanji[k] !== undefined) {
            return this.kanji[k].levelNumber;
        }
        
        return -1;
    }

    getVocabLevel(v) {
        if (this.vocab[v] !== undefined) {
            return this.kanji[v].levelNumber;
        }
        
        return -1;
    }
};

function getLevelNumber(level) {
    switch (level) {
        case "apprentice": return 0;
        case "guru": return 1;
        case "master": return 2;
        case "englighten": return 3;
        case "burned": return 4;
        default: return -1;
    }
}

const Kanji = class {
    constructor(data) {
        this.level = data.level;
        this.levelNumber = getLevelNumber(this.level);
        this.character = data.character;
        this.meaning = data.meaning.split(", ");
        this.onyomi = data.onyomi === null ? null : data.onyomi.split(", ");
        this.kunyomi = data.kunyomi === null ? null : data.kunyomi.split(", ");
        this.important_reading = data.important_reading;
        this.nanori = data.nanori;
        this.user_specific = data.user_specific;
    }
};

const Vocab = class {
    constructor(data) {
        this.level = data.level;
        this.levelNumber = getLevelNumber(this.level);
        this.character = data.character;
        this.kana = data.kana.split(", ");
        this.meaning = data.meaning.split(", ");
        this.user_specific = data.user_specific;
    }
};