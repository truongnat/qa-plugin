#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const docsDir = path.join(projectRoot, "docs");
const docsAssetsDir = path.join(docsDir, "assets");

fs.mkdirSync(docsAssetsDir, { recursive: true });

console.log(`Ensured docs directory: ${docsDir}`);
console.log(`Ensured docs assets directory: ${docsAssetsDir}`);
