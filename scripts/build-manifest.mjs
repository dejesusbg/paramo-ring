#!/usr/bin/env node
// Regenerates members.json (the flat manifest embed.js fetches) and the
// members table in README.md from members/*.json. Run by CI on every push
// to main that touches members/*.json.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const MEMBERS_DIR = join(ROOT, 'members');
const MANIFEST_PATH = join(ROOT, 'members.json');
const README_PATH = join(ROOT, 'README.md');
const START_MARKER = '<!-- members:start -->';
const END_MARKER = '<!-- members:end -->';

function loadMembers() {
  const files = readdirSync(MEMBERS_DIR).filter((f) => f.endsWith('.json'));
  const members = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    let data;
    try {
      data = JSON.parse(readFileSync(join(MEMBERS_DIR, file), 'utf8'));
    } catch {
      continue; // skip unparsable files rather than fail the build
    }
    if (data.active !== true) continue;
    if (typeof data.name !== 'string' || typeof data.url !== 'string') continue;
    members.push({ slug, name: data.name, url: data.url });
  }

  members.sort((a, b) => a.slug.localeCompare(b.slug));
  return members;
}

function writeManifest(members) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(members, null, 2) + '\n');
}

function writeReadmeTable(members) {
  const readme = readFileSync(README_PATH, 'utf8');
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) return;

  const rows = members.map((m) => `| [${m.name}](${m.url}) |`).join('\n');
  const table = `${START_MARKER}\n| Member |\n| --- |\n${rows}\n${END_MARKER}`;

  const updated = readme.slice(0, startIdx) + table + readme.slice(endIdx + END_MARKER.length);
  writeFileSync(README_PATH, updated);
}

const members = loadMembers();
writeManifest(members);
writeReadmeTable(members);
console.log(`Wrote members.json and README.md table with ${members.length} active member(s).`);
