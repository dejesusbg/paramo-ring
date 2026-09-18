#!/usr/bin/env node
// Validates every members/*.json file. Run in CI on pull requests that touch
// members/*.json. Exits 1 if any file fails a check.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MEMBERS_DIR = new URL('../members/', import.meta.url).pathname;
const SLUG_RE = /^[a-z0-9-]+$/;
const ALLOWED_FIELDS = new Set(['name', 'url', 'active']);
const REQUIRED_FIELDS = ['name', 'url', 'active'];
const FETCH_TIMEOUT_MS = 8000;

async function checkLive(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    return res.ok ? { ok: true } : { ok: false, message: `responded with HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, message: `unreachable (${err.name === 'AbortError' ? 'timed out' : err.message})` };
  } finally {
    clearTimeout(timeout);
  }
}

function checkStatic(slug, data) {
  const errors = [];

  if (!SLUG_RE.test(slug)) {
    errors.push(`filename "${slug}.json" must match ${SLUG_RE} (lowercase letters, digits, hyphens)`);
  }

  const keys = Object.keys(data);
  for (const key of keys) {
    if (!ALLOWED_FIELDS.has(key)) errors.push(`unknown field "${key}"`);
  }
  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) errors.push(`missing required field "${field}"`);
  }

  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('"name" must be a non-empty string');
  }
  if (typeof data.url !== 'string' || !data.url.startsWith('https://')) {
    errors.push('"url" must be a string starting with "https://"');
  }
  if (typeof data.active !== 'boolean') {
    errors.push('"active" must be a boolean');
  }

  return errors;
}

async function main() {
  const files = readdirSync(MEMBERS_DIR).filter((f) => f.endsWith('.json'));
  const seenSlugs = new Set();
  const seenUrls = new Map();
  const results = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const errors = [];
    let data;

    try {
      data = JSON.parse(readFileSync(join(MEMBERS_DIR, file), 'utf8'));
    } catch (err) {
      results.push({ file, errors: [`invalid JSON: ${err.message}`] });
      continue;
    }

    errors.push(...checkStatic(slug, data));

    if (seenSlugs.has(slug)) errors.push(`duplicate slug "${slug}"`);
    seenSlugs.add(slug);

    if (typeof data.url === 'string') {
      const normalized = data.url.replace(/\/$/, '').toLowerCase();
      if (seenUrls.has(normalized)) {
        errors.push(`url already claimed by "${seenUrls.get(normalized)}.json"`);
      } else {
        seenUrls.set(normalized, slug);
      }
    }

    if (errors.length === 0 && data.active === true && typeof data.url === 'string') {
      const live = await checkLive(data.url);
      if (!live.ok) errors.push(`live check failed: ${live.message}`);
    }

    results.push({ file, errors });
  }

  const failed = results.filter((r) => r.errors.length > 0);

  const lines = ['## Páramo Ring member validation', ''];
  for (const { file, errors } of results) {
    lines.push(errors.length === 0 ? `- ✅ \`${file}\`` : `- ❌ \`${file}\``);
    for (const err of errors) lines.push(`  - ${err}`);
  }
  console.log(lines.join('\n'));

  process.exit(failed.length > 0 ? 1 : 0);
}

main();
