import { chromium } from "playwright";

const OUT = process.argv[2] || ".";

const browser = await chromium.launch();

const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await desktop.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await desktop.waitForTimeout(900);
await desktop.screenshot({ path: `${OUT}/desktop-full.png` });
const heroDesktop = await desktop.$("#top");
await heroDesktop.screenshot({ path: `${OUT}/desktop-hero.png` });
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(900);
await mobile.screenshot({ path: `${OUT}/mobile-full.png` });
const heroMobile = await mobile.$("#top");
await heroMobile.screenshot({ path: `${OUT}/mobile-hero.png` });
await mobile.close();

await browser.close();
console.log("done");
