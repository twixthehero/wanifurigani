# Wani-Furigani v0.3.3

by Maximilian Wright

A Chrome extension that connects to a WaniKani user's profile and selectively hides furigana on webpages based on their WaniKani level.

## Features
- Toggle learned furigana on/off
- Hover to show furigana
- Change minimum level required for furigana to be hidden

## Installation

### Google Chrome
1. Click [here](https://chrome.google.com/webstore/detail/wani-furigani/emmjhiomlaofcbfffajikicpkficpblj) to go to the Chome Webstore page.
1. Click '+ Add to Chrome'
1. Click 'Add extension'

## Development

### Google Chrome
1. `git clone git@github.com:twixthehero/wanifurigani.git`
1. `cd wanifurigani`
1. Windows: Run `build.bat` Linux: Run `chmod +x build.sh && build.sh`
1. Open a tab and navigate to `chrome://extensions`
1. Click "Load unpacked"
1. Navigate to `wanifurigani/build/` and click OK

## To Do
* Add hiding based on WaniKani vocabulary
* Add FireFox version

## Current Limitations
* Does not hide furigana unless all characters within a `<ruby>` element are known

Credits:
* https://github.com/darren-lester/furigana-toggle