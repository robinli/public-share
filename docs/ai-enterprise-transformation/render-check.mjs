import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire("C:/Users/robin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/");
const { chromium } = require("playwright");

const deckPath = "F:/Temp/guizang-ppt-skill/output/ai-enterprise-transformation/ppt/index.html";
const outDir = "F:/Temp/guizang-ppt-skill/output/ai-enterprise-transformation/ppt/previews";
fs.mkdirSync(outDir, { recursive: true });

const executablePath = fs.existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
  ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
  : "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});

await page.goto(`file:///${deckPath}`);
await page.waitForTimeout(1200);

const total = await page.locator(".slide").count();
const dots = await page.locator("#nav .dot").count();
const title = await page.title();
const shots = [];

for (const index of Array.from({ length: total }, (_, i) => i)) {
  await page.locator("#nav .dot").nth(index).click();
  await page.waitForTimeout(900);
  const file = path.join(outDir, `slide-${String(index + 1).padStart(2, "0")}.png`);
  await page.screenshot({ path: file, fullPage: false });
  shots.push(file);
}

await page.keyboard.press("Escape");
await page.waitForTimeout(500);
const overviewVisible = await page
  .locator("#overview")
  .evaluate((element) => getComputedStyle(element).display !== "none");

await browser.close();

console.log(JSON.stringify({ title, total, dots, overviewVisible, errors, shots }, null, 2));
