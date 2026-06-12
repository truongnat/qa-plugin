#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const supportedDependencies = new Set(["playwright", "ffmpeg"]);
const requested = process.argv.slice(2);
const dependencies =
  requested.length === 0 || requested.includes("all")
    ? [...supportedDependencies]
    : requested;

const invalid = dependencies.filter(
  (dependency) => !supportedDependencies.has(dependency),
);

if (invalid.length > 0) {
  console.error(
    `Unknown dependency: ${invalid.join(", ")}. Expected playwright, ffmpeg, or all.`,
  );
  process.exit(2);
}

function commandExists(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    windowsHide: true,
  });

  return {
    available: !result.error && result.status === 0,
    version: (result.stdout || result.stderr || "").split(/\r?\n/, 1)[0].trim(),
  };
}

function checkPlaywright() {
  try {
    const packagePath = require.resolve("playwright/package.json", {
      paths: [process.cwd()],
    });
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const playwright = require(path.dirname(packagePath));
    const browserPath = playwright.chromium.executablePath();

    return {
      available: fs.existsSync(browserPath),
      packageInstalled: true,
      browserInstalled: fs.existsSync(browserPath),
      version: packageJson.version,
      browserPath,
      installCommands: fs.existsSync(browserPath)
        ? []
        : ["npx playwright install chromium"],
    };
  } catch {
    return {
      available: false,
      packageInstalled: false,
      browserInstalled: false,
      installCommands: [
        "npm install --save-dev playwright",
        "npx playwright install chromium",
      ],
    };
  }
}

function checkFfmpeg() {
  const result = commandExists("ffmpeg", ["-version"]);

  return {
    ...result,
    installCommands: result.available
      ? []
      : process.platform === "win32"
        ? ["winget install --id Gyan.FFmpeg.Shared --exact"]
        : process.platform === "darwin"
          ? ["brew install ffmpeg"]
          : ["sudo apt-get update && sudo apt-get install -y ffmpeg"],
  };
}

const checks = {};

for (const dependency of dependencies) {
  checks[dependency] =
    dependency === "playwright" ? checkPlaywright() : checkFfmpeg();
}

const result = {
  ok: Object.values(checks).every((check) => check.available),
  platform: process.platform,
  cwd: process.cwd(),
  dependencies: checks,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
