#!/usr/bin/env node

// src/index.ts
import { platform } from "os";
import { existsSync } from "fs";
import { exec, execSync } from "child_process";
var BROWSERS = {
  windows: [
    { name: "Chrome", cmd: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
    { name: "Firefox", cmd: "C:\\Program Files\\Mozilla Firefox\\firefox.exe" },
    { name: "Edge", cmd: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" },
    { name: "Brave", cmd: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" },
    { name: "Vivaldi", cmd: "C:\\Program Files\\Vivaldi\\Application\\vivaldi.exe" },
    { name: "Opera", cmd: "C:\\Program Files\\Opera\\launcher.exe" }
  ],
  darwin: [
    { name: "Chrome", cmd: "/Applications/Google Chrome.app" },
    { name: "Safari", cmd: "/Applications/Safari.app" },
    { name: "Firefox", cmd: "/Applications/Firefox.app" },
    { name: "Brave", cmd: "/Applications/Brave Browser.app" },
    { name: "Edge", cmd: "/Applications/Microsoft Edge.app" },
    { name: "Vivaldi", cmd: "/Applications/Vivaldi.app" },
    { name: "Opera", cmd: "/Applications/Opera.app" }
  ],
  linux: [
    { name: "Chromium", cmd: "chromium" },
    { name: "Firefox", cmd: "firefox" },
    { name: "Chrome", cmd: "google-chrome" },
    { name: "Brave", cmd: "brave-browser" },
    { name: "Vivaldi", cmd: "vivaldi" },
    { name: "Opera", cmd: "opera" }
  ]
};
function which(command) {
  try {
    let output = execSync(`which ${command}`).toString().trim() || null;
    return output;
  } catch (error) {
    return null;
  }
}
function detectBrowsers() {
  let os = platform();
  let foundBrowsers = [];
  if (os === "win32") {
    for (let browser of BROWSERS.windows) {
      if (existsSync(browser.cmd)) {
        foundBrowsers.push(browser);
      }
    }
  } else if (os === "darwin") {
    for (let browser of BROWSERS.darwin) {
      if (existsSync(browser.cmd)) {
        foundBrowsers.push(browser);
      }
    }
  } else if (os === "linux") {
    for (let browser of BROWSERS.linux) {
      if (which(browser.cmd)) {
        foundBrowsers.push(browser);
      }
    }
  } else {
    console.log("Unsupported OS");
    return;
  }
  return foundBrowsers;
}
function launchApp(url) {
  let os = platform();
  let detectedBrowsers = detectBrowsers();
  let browserToUse;
  let tryDefaultBrowser = false;
  let preferredBrowsers = {
    win32: ["Chrome", "Firefox", "Edge", "Brave", "Vivaldi", "Opera"],
    darwin: ["Chrome", "Safari", "Firefox", "Edge", "Brave", "Vivaldi", "Opera"],
    linux: ["Chromium", "Firefox", "Brave", "Chrome", "Vivaldi", "Opera"]
  };
  console.log(`Detected OS: ${os}`);
  console.log(`Detected browsers: ${detectedBrowsers ? detectedBrowsers.map((b) => b.name).join(", ") : "None"}`);
  url = url.startsWith("http") ? url : url.startsWith("localhost") ? `http://${url}` : `https://${url}`;
  if (detectedBrowsers) {
    let width = 960;
    let height = 800;
    let osName = os;
    let browsersForOS = preferredBrowsers[osName] || [];
    let preferredBrowser = browsersForOS.find((name) => detectedBrowsers.some((b) => b.name === name));
    if (preferredBrowser) {
      browserToUse = detectedBrowsers.find((b) => b.name === preferredBrowser);
    } else {
      browserToUse = detectedBrowsers[0];
    }
    if (browserToUse) {
      let sizeInfo = `--window-size=${width},${height}`;
      if (os !== "darwin") {
        if (browserToUse.cmd.includes("Firefox")) {
          sizeInfo = `--width=${width} --height=${height}`;
          exec(`"${browserToUse.cmd}" "${url}" ${sizeInfo}`);
        } else {
          exec(`"${browserToUse.cmd}" --app="${url}" ${sizeInfo} --new-window --user-data-dir="/tmp/temp-profile"`);
        }
      } else {
        if (browserToUse.cmd.includes("Firefox")) {
          sizeInfo = `--width=${width} --height=${height}`;
          exec(`open -na "${browserToUse.cmd}" "${url}" ${sizeInfo}`);
        } else {
          exec(`open -na "${browserToUse.cmd}" --args --app="${url}" --new-window --user-data-dir="/tmp/temp-profile"`);
        }
      }
    } else {
      tryDefaultBrowser = true;
    }
  }
  if (tryDefaultBrowser) {
    if (os === "win32") {
      exec(`start "" "${url}"`);
    } else if (os === "darwin") {
      exec(`open "${url}"`);
    } else if (os === "linux") {
      exec(`xdg-open "${url}"`);
    } else {
      console.log("Unsupported OS for launching app!");
    }
  }
}
function start() {
  let args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("No URL provided! Usage: npx oxr <url>");
    process.exit(1);
  }
  launchApp(args[0]);
}
start();
