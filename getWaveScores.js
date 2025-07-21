/**
 * getWaveScores.js
 *
 * Description:
 * -------------
 * This script automates accessibility testing of multiple web pages using the WAVE Chrome extension.
 * It reads a list of URLs from a text file (default: urls.txt), opens each URL in a Puppeteer-controlled
 * browser with the WAVE extension preloaded, extracts the number of accessibility errors from the WAVE
 * sidebar (injected into the page after activation), and prints a CSV-formatted list of results to standard output.
 *
 * Important:
 * -------------
 * The WAVE extension **must be activated manually** on each page after it loads. The user must click
 * the WAVE toolbar icon or use the keyboard shortcut (e.g., Cmd/Ctrl + Shift + U) to trigger the analysis.
 * This limitation exists because browser extensions cannot be programmatically triggered via Puppeteer.
 *
 * Usage:
 * ------
 *   node getWaveScores.js [optional_path_to_urls.txt]
 *
 * Output:
 * -------
 *   URL,WAVE_Errors
 *   https://example.com,5
 *   https://another.com,ERROR
 *
 * Notes:
 * ------
 * - Requires an unpacked copy of the WAVE Chrome extension.
 * - Uses a helper shell script (findWaveExtension.sh) to locate the WAVE extension directory.
 * - Runs in non-headless mode because Chrome extensions are not supported in headless mode.
 *
 * License:
 * --------
 * This code is released under the MIT License on July 21, 2025 by Zoltan Hawryluk.
 */



const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  let waveExtensionPath;

  try {
    waveExtensionPath = execSync('./findWaveExtension.sh', { encoding: 'utf8' }).trim();
  } catch (err) {
    console.error('Failed to get WAVE extension path from findWaveExtension.sh');
    process.exit(1);
  }

  // Read URL list from file (default: urls.txt)
  const inputFile = process.argv[2] || 'urls.txt';
  let urls;

  try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    urls = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  } catch (err) {
    console.error(`Failed to read file: ${inputFile}`);
    process.exit(1);
  }

  // Output CSV header
  console.log('URL,WAVE_Errors');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${waveExtensionPath}`,
      `--load-extension=${waveExtensionPath}`,
    ],
    defaultViewport: null,
  });

  for (const url of urls) {
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForSelector('#wave_sidebar_container', { timeout: 10000 });

      const iframeElement = await page.$('#wave_sidebar_container');
      const frame = await iframeElement.contentFrame();

      await new Promise(resolve => setTimeout(resolve, 1000));

      const errorCount = await frame.evaluate(() => {
        const htmlEl = document.documentElement;
        const el = htmlEl.querySelector('#error');

        const errorVal = el ? parseInt(el.innerText, 10) || 0 : -1;
        //const contrastVal = el2 ? parseInt(el2.innerText, 10) || 0 : -1;

        return (errorVal !== -1 )
          ? errorVal
          : -1;
      });

      console.log(`${url},${errorCount}`);
    } catch (e) {
      console.log(`${url},ERROR`);
    }

    await page.close();
  }

  await browser.close();
})();
