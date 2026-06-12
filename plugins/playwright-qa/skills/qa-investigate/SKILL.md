---
name: investigate
description: Investigate a website URL, source code repository, or both, then generate a structured QA investigation report as an HTML artifact with live preview support.
---

---

# Purpose

This skill performs an initial QA investigation of a target system before any test automation is generated.

The primary goal is to understand the product, identify risks, discover functionality, and produce a human-friendly investigation report that can be reviewed by testers, developers, PMs, and stakeholders.

This skill is the first step of the QA workflow.

Do NOT generate Playwright tests unless explicitly requested by the user.

---

# Supported Modes

## URL Mode

Input:

- Website URL
- Staging URL
- Production URL

Behavior:

- Treat the system as a black box
- Explore navigation
- Discover pages
- Discover forms
- Discover interactions
- Observe network behavior when possible
- Identify visible user flows
- Identify potential risks
- Record unknowns

---

## Source Code Mode

Input:

- Local project
- Git repository
- Workspace folder

Behavior:

- Analyze project structure
- Discover routes/pages
- Discover APIs
- Discover authentication flows
- Discover permissions
- Discover validations
- Discover existing tests
- Identify high-risk areas
- Build QA understanding of the system

---

## Hybrid Mode

Input:

- URL
- Source Code

Behavior:

Combine runtime observations with source code analysis.

Runtime behavior always takes precedence over assumptions.

---

# Optional Runtime Dependencies

Playwright and FFmpeg are optional. Do not install either dependency when the
plugin starts or when a task can be completed through source analysis alone.

## Dependency Preflight

Run a preflight only when the requested work needs the corresponding capability:

- Browser navigation, runtime inspection, screenshots, traces, or browser video:
  `node ${PLUGIN_ROOT}/scripts/check-dependencies.js playwright`
- Video encoding, conversion, compression, or post-processing:
  `node ${PLUGIN_ROOT}/scripts/check-dependencies.js ffmpeg`
- A task that needs both:
  `node ${PLUGIN_ROOT}/scripts/check-dependencies.js all`

The preflight script only checks availability. It must never install software.

## Installation Consent

If a required dependency is missing:

1. Stop before attempting the browser or video operation.
2. Tell the user which dependency is missing and why the current task needs it.
3. Show the exact install command or commands from the preflight output.
4. Explicitly ask the user for permission to run those commands.
5. Do not install, download, or invoke an installer until the user approves.
6. After approval, run only the approved commands and repeat the preflight.
7. If installation fails, report the failing command and error. Do not switch
   package managers or install globally without separate permission.

For Playwright, install the package in the target project and install Chromium:

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Do not use `npx playwright` as an availability check because `npx` may download
the package without consent. Always use the preflight script.

FFmpeg installation is system-level. Use the platform-specific command returned
by the preflight and ask before running it.

---

# Required Deliverables

The investigation must generate the following runtime artifacts.

## Report

Create:

`docs/investigate-<YYYY-MM-DD-HH-mm-ss>.html`

Examples:

```txt
docs/investigate-2026-06-12-15-30-01.html
docs/investigate-2026-06-12-17-41-55.html
```

Never overwrite previous reports.

Always create a new timestamped report.

---

## Assets

Ensure:

```txt
docs/
docs/assets/
```

exist.

Ensure:

```txt
docs/assets/report.css
```

exists.

If the file does not exist:

Copy the shared stylesheet from:

```txt
plugins/playwright-qa/assets/report.css
```

to:

```txt
docs/assets/report.css
```

All generated reports must use the shared stylesheet.

Do not generate ad-hoc CSS.

Do not generate different styles for different reports.

All reports must have a consistent visual identity.

---

# HTML Report Structure

The generated report must contain the following sections.

## Executive Summary

High-level understanding of the system.

---

## Investigation Metadata

- Investigation Date
- Investigation Mode
- URL
- Repository Path
- Investigator
- Environment

---

## System Overview

Describe:

- Product purpose
- Target users
- Main modules
- Business goals

---

## Discovered Pages & Routes

List:

- Pages
- Screens
- Routes
- Navigation structure

---

## Main User Flows

Examples:

- Login
- Registration
- Search
- Checkout
- Upload
- Approval
- Administration

Include diagrams when possible.

---

## Forms & Interactions

Identify:

- Inputs
- Dropdowns
- Tables
- Filters
- Uploads
- Wizards
- Modals

---

## Data Screens

Identify:

- Tables
- Lists
- Dashboards
- Detail views

---

## Authentication & Permissions

Identify:

- Login mechanisms
- Roles
- Permission boundaries
- Session behavior
- Security concerns

---

## API & Network Observations

Identify:

- Observed APIs
- Request patterns
- External services
- Integrations

---

## QA Risk Assessment

Categorize risks:

### Critical

### High

### Medium

### Low

Each risk should contain:

- Area
- Description
- Impact
- Likelihood
- Suggested Coverage

---

## Suggested Test Coverage

Recommend:

### Smoke

### Functional

### Negative

### Permission

### Responsive

### Accessibility

### Regression

### Visual

---

## Unknowns & Blockers

List all assumptions.

Never invent information.

Clearly distinguish:

- Known
- Assumed
- Unknown

---

## Recommended Next Actions

Examples:

- Generate test map
- Generate Playwright tests
- Investigate APIs
- Investigate permissions
- Review business rules

---

# Preview Server

After generating the report:

Ensure a local preview server is running.

Use:

```bash
node plugins/playwright-qa/scripts/preview-server.js
```

The preview server must serve the `docs` directory.

---

# Preview URL

Return:

```txt
http://127.0.0.1:4173/
```

and

```txt
http://127.0.0.1:4173/investigate-<timestamp>.html
```

when available.

---

# Output Rules

Do not dump the entire investigation into chat.

The HTML report is the primary output.

Chat output should contain only:

- Summary
- Generated report path
- Preview URL
- Next recommended action

---

# Investigation Quality Rules

Always think like a Senior QA Lead.

Focus on:

- Product understanding
- Risk discovery
- Coverage planning

Do not focus on automation implementation.

Do not generate Playwright code.

Do not generate bug reports.

Do not generate regression reports.

The sole responsibility of this skill is investigation and understanding.

# Template Rules

Use the plugin HTML template:

`plugins/playwright-qa/templates/investigate.html`

Use the plugin CSS preset:

`plugins/playwright-qa/assets/report.css`

When generating a report:

1. Read the HTML template.
2. Replace all `{{PLACEHOLDER}}` tokens with investigated content.
3. Copy `plugins/playwright-qa/assets/report.css` to `docs/assets/report.css`.
4. Save the final HTML to `docs/investigate-<YYYY-MM-DD-HH-mm-ss>.html`.

Do not invent a new layout.

Do not generate a new CSS file.

Do not inline CSS unless the shared CSS is missing.
