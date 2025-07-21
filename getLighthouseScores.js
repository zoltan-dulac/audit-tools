const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const inputFile = process.argv[2] || 'urls.txt';

// Read URLs from the input file
let urls;
try {
  const content = fs.readFileSync(inputFile, 'utf8');
  urls = content.split(/\r?\n/).filter(line => line.trim().length > 0);
} catch (err) {
  console.error(`Failed to read file: ${inputFile}`);
  process.exit(1);
}

// Output CSV header
console.log('URL,Accessibility_Score');

// Function to run Lighthouse on a URL and extract the accessibility score
function runLighthouse(url) {
  return new Promise((resolve) => {
    const command = `lighthouse ${url} --only-categories=accessibility --quiet --output=json --output-path=stdout`;

    exec(command, { maxBuffer: 1024 * 500 }, (error, stdout) => {
      if (error) {
        resolve({ url, score: 'ERROR' });
        return;
      }

      try {
        const report = JSON.parse(stdout);
        const score = report.categories.accessibility.score;
        resolve({ url, score: Math.round(score * 100) });
      } catch (parseError) {
        resolve({ url, score: 'PARSE_ERROR' });
      }
    });
  });
}

// Run audits sequentially (to avoid Chrome conflicts)
(async () => {
  for (const url of urls) {
    const result = await runLighthouse(url);
    console.log(`${result.url},${result.score}`);
  }
})();