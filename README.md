# Playwright QA Plugin

A local Codex plugin for investigating websites and source repositories, then
generating structured QA reports with a live HTML preview.

The plugin supports URL, source-code, and hybrid investigations. Playwright and
FFmpeg are optional runtime dependencies and are installed only after the user
explicitly approves the proposed install commands.

## Features

- Investigates websites as black-box systems.
- Analyzes local source repositories.
- Combines runtime observations with source analysis.
- Generates timestamped reports under `docs/`.
- Serves generated reports from a local preview server.
- Checks Playwright and FFmpeg only when a task needs them.
- Never installs optional dependencies without user consent.

## Repository Layout

```text
.agents/plugins/marketplace.json       Local marketplace definition
plugins/playwright-qa/
  .codex-plugin/plugin.json            Plugin manifest
  assets/report.css                    Shared report stylesheet
  hooks/                               Codex lifecycle hooks
  scripts/check-dependencies.js        Optional dependency preflight
  scripts/preview-server.js            Report preview server
  skills/qa-investigate/SKILL.md       Investigation workflow
  templates/investigate.html           Report template
```

## Install

Register this repository as a local marketplace:

```powershell
codex plugin marketplace add .
```

Install the plugin:

```powershell
codex plugin add playwright-qa@local-plugins
```

Start a new Codex thread after installation so the new plugin context is loaded.

## Usage

Use the plugin's investigation skill with a URL, repository, or both:

```text
@investigate Investigate https://example.com and generate a QA preview report.
```

```text
@investigate Investigate this repository and generate a QA preview report.
```

Reports are created without overwriting previous output:

```text
docs/investigate-<YYYY-MM-DD-HH-mm-ss>.html
```

The preview server is available at:

```text
http://127.0.0.1:4173/
```

## Optional Dependencies

Playwright is needed for browser navigation, runtime inspection, screenshots,
traces, and browser video. FFmpeg is needed for video encoding, conversion,
compression, or post-processing.

Run the dependency preflight from the target project:

```powershell
node plugins/playwright-qa/scripts/check-dependencies.js playwright
node plugins/playwright-qa/scripts/check-dependencies.js ffmpeg
node plugins/playwright-qa/scripts/check-dependencies.js all
```

The preflight only reports availability and suggested install commands. It does
not download or install anything.

When a required dependency is missing, the plugin must:

1. Explain why the dependency is needed.
2. Show the exact proposed install command.
3. Ask for explicit permission.
4. Run the command only after approval.
5. Repeat the preflight before continuing.

Typical Playwright installation:

```powershell
npm install --save-dev playwright
npx playwright install chromium
```

FFmpeg is installed at the system level. The preflight returns a command
appropriate for the current operating system.

## Development

Validate the plugin:

```powershell
python "$HOME\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py" `
  ".\plugins\playwright-qa"
```

Update the plugin cachebuster after making changes:

```powershell
python "$HOME\.codex\skills\.system\plugin-creator\scripts\update_plugin_cachebuster.py" `
  ".\plugins\playwright-qa"
```

Reinstall the updated version:

```powershell
codex plugin add playwright-qa@local-plugins
```

Then start a new Codex thread to load the updated skill and scripts.
