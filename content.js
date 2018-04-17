chrome.storage.sync.get({
    furiganaOff: false,
    hoverReveal: true,
    colour: false,
    kanjiColour: '#0000ff',
    furiganaColour: '#ff0000'
}, function (items) {
    if (items.hoverReveal) {
        document.body.classList.add('furigana-toggle-hover');
    } else {
        document.body.classList.remove('furigana-toggle-hover');
    }

    if (items.hoverReveal && items.colour) {
        document.body.classList.add('furigana-toggle-colour');
    } else {
        document.body.classList.remove('furigana-toggle-colour');
    }

    if (items.furiganaOff) {
        addStyle();
        setColour(items);
    } else {
        removeStyle();
    }
});

function addStyle() {
    document.body.classList.add('furigana-toggle');

    if (hasStyle()) {
        return;
    }

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.extension.getURL('furigana-toggle.css');
    stylesheet.id = 'furigana-toggle-css';
    document.head.appendChild(stylesheet);
}

function setColour(colours) {
    document.getElementsByTagName('body')[0].style.setProperty('--kanji-colour', colours.kanjiColour);
    document.getElementsByTagName('body')[0].style.setProperty('--furigana-colour', colours.furiganaColour);
}

function hasStyle() {
    return Boolean(document.getElementById('furigana-toggle-css'));
}

function removeStyle() {
    document.body.classList.remove('furigana-toggle');
    document.body.classList.remove('furigana-toggle-hover');
    document.body.classList.remove('furigana-toggle-colour');
}