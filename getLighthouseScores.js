#!/usr/bin/env node
/**
 * Run Lighthouse accessibility audits for a list of URLs (one per line in a text file)
 * using a single long-lived Chrome instance for better performance.
 *
 * Usage:
 *   node getLighthouseScores.js urls.txt > lighthouse_scores.csv
 *
 * CSV output header is written automatically.
 */

const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

const inputFile = process.argv[2] || 'urls.txt';

// --- Read URL list ---------------------------------------------------------
let urls;
try {
  const content = fs.readFileSync(inputFile, 'utf8');
  urls = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!urls.length) {
    console.error(`No URLs found in ${inputFile}.`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Failed to read file: ${inputFile}`);
  console.error(err.message);
  process.exit(1);
}

// --- Launch Chrome once ----------------------------------------------------
async function run() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [         
      '--headless=new',  // use headless; drop =new if older Chrome
      '--no-first-run',
      '--disable-gpu',
    ],
  });

  const opts = {
    port: chrome.port,
    logLevel: 'error',
    output: 'json',              // we’ll use the JS object; report string still produced
    onlyCategories: ['accessibility'],
    formFactor: 'desktop', // 👈 this is key
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
  };

  // CSV header
  console.log('URL,Accessibility_Score');

  for (const url of urls) {
    let scoreOut = 'ERROR';
    try {
      const runnerResult = await lighthouse(url, opts);
      // runnerResult.lhr is the Lighthouse Result object
      const score = runnerResult.lhr.categories.accessibility.score;
      // score is 0–1 float; convert to integer percent
      scoreOut = Math.round(score * 100);
    } catch (err) {
      console.error(err);
      // leave scoreOut as 'ERROR'
    }
    console.log(`${url},${scoreOut}`);
  }

  await chrome.kill();
}

run().catch(err => {
  console.error('Fatal error running Lighthouse batch:', err);
  process.exit(1);
});
