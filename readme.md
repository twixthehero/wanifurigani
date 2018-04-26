# Wani-Furigani

© 2018 Maximilian Wright

A Chrome extension that connects to a WaniKani user's profile and selectively hides furigana on webpages based on their WaniKani level.

## Features
- Toggle learned furigana on/off
- Change minimum level required for furigana to be hidden

## Unpacked Usage

### Google Chrome
1. `git clone --recurse-submodules git@github.com:twixthehero/wanifurigani.git`
1. `cd wanifurigani`
1. Windows: Run `build.bat` Linux: Run `build.sh`
1. Open a tab and navigate to `chrome://extensions`
1. Click "Load unpacked"
1. Navigate to `wanifurigani/build/` and click OK

## To Do
* Add resync button
* Add hiding based on WaniKani vocabulary
* Add FireFox version

## Current Limitations
* Does not hide furigana unless all characters within a `<ruby>` element are known

Credits:
* https://github.com/darren-lester/furigana-toggle