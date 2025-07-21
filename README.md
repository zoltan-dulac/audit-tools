# audit-tools
A suite of command line tools I use to make auditing faster.

## Commands

* `getLighthouseScores.js` - If you creste a list of urls, one url per line, in the file urls.txt.  This script will go into that file and generate a Lighthouse accessibility score for each URL.
* `getWaveScores.js` - similar to `getLighhouseScores.js`, except it generates the number of WAVE errors for each page using the Wave Toolbar.  The difference here is that the WAVE Toolbar plugin button has to be clicked when the browser opens the page, since there is no way to automate this (as far as I know).
* `findWaveExtension.sh` - used by `getWaveScores.js` to find the location of the WAVE toolbar on the local filesystem.


## Installation

`node ci` should just about do it.