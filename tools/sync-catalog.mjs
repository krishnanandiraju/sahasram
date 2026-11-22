// Pulls the BoutiqueOS Storefront Feed into <out>/data/ so the static site can read it.
//
//   Live (CI):  node tools/sync-catalog.mjs --out dist [--skip-if-unchanged]
//     env BOUTIQUEOS_BASE_URL, BOUTIQUEOS_CLIENT_ID, BOUTIQUEOS_CLIENT_SECRET (secret),
//         BOUTIQUEOS_PUBLISHABLE_KEY (optional), DEPLOYED_SITE_URL (optional, for the
//         "nothing changed" check and the product-count safety check)
//   Samples:    node tools/sync-catalog.mjs --out . --from-file <samples folder>
//
// Writes data/catalog.json, data/manifest.json and data/site-config.json. Exits non-zero
// (so nothing is deployed) when the feed fails validation, cannot be reached after three
// tries, or the product count falls by more than half since the deployed version.
import {mkdir, readFile, writeFile, appendFile} from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const out = path.resolve(opt("--out") || ".");
const fromFile = opt("--from-file");
const skipIfUnchanged = args.includes("--skip-if-unchanged");
const env = process.env;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function setOutput(values) {
  for (const [k, v] of Object.entries(values)) console.log(`${k}=${v}`);
  if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, Object.entries(values).map(([k, v]) => `${k}=${v}\n`).join(""));
}
// Errors unwind to main() so the process ends normally (a forced exit with open
// sockets crashes Node on Windows).
class SyncFailure extends Error {}
function fail(message) { throw new SyncFailure(message); }

function validate(catalog, manifest) {
  if (!String(catalog.schema_version || "").startsWith("1.")) fail(`unsupported schema_version ${catalog.schema_version}`);
  if (!Array.isArray(catalog.products)) fail("catalog.products is not a list");
  if (manifest && manifest.catalog_version !== catalog.catalog_version) console.warn(`manifest v${manifest.catalog_version} and catalog v${catalog.catalog_version} differ; using the catalog's`);
  const problems = [];
  for (const p of catalog.products) {
    const where = p?.id || "(no id)";
    if (!p?.id || !p.name || !p.category) problems.push(`${where}: missing id, name or category`);
    if (typeof p?.price?.amount !== "number") problems.push(`${where}: price.amount is not a number`);
    if (!Array.isArray(p?.sizes) || !p.sizes.length) problems.push(`${where}: no sizes`);
    if (!Array.isArray(p?.images) || !p.images.length) problems.push(`${where}: no images`);
    for (const img of p?.images || []) if (!(img.renditions || []).some(r => /^https:\/\//.test(r.url))) problems.push(`${where}/${img.id}: no https rendition`);
    if (JSON.stringify(p).includes("cost_price")) problems.push(`${where}: contains cost_price`);
  }
  if (problems.length) fail(`catalog failed validation:\n  ${problems.slice(0, 20).join("\n  ")}${problems.length > 20 ? `\n  …and ${problems.length - 20} more` : ""}`);
}

async function request(url, headers = {}) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {headers});
      if (res.status === 304) return {status: 304};
      if (res.status === 401 || res.status === 403) fail(`${url}: ${res.status} — check BOUTIQUEOS_CLIENT_ID and BOUTIQUEOS_CLIENT_SECRET`);
      if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
      return {status: res.status, body: await res.json()};
    } catch (err) {
      if (err instanceof SyncFailure) throw err;
      last = err;
      console.warn(`attempt ${attempt} for ${url} failed: ${err.message}`);
      if (attempt < 3) await sleep(20000);
    }
  }
  fail(`${url} unreachable after 3 tries: ${last?.message}`);
}

async function previousDeploy() {
  if (!env.DEPLOYED_SITE_URL) return null;
  try {
    const res = await fetch(`${env.DEPLOYED_SITE_URL.replace(/\/$/, "")}/data/manifest.json`, {cache: "no-store"});
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

async function main() {
let catalog, manifest, siteConfig = {};
if (fromFile) {
  const dir = fromFile.endsWith(".json") ? path.dirname(fromFile) : fromFile;
  catalog = JSON.parse(await readFile(fromFile.endsWith(".json") ? fromFile : path.join(dir, "catalog.json"), "utf8"));
  manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8").catch(() => "null"));
  validate(catalog, manifest);
} else {
  const base = (env.BOUTIQUEOS_BASE_URL || "").replace(/\/$/, "");
  if (!base || !env.BOUTIQUEOS_CLIENT_ID || !env.BOUTIQUEOS_CLIENT_SECRET) fail("BOUTIQUEOS_BASE_URL, BOUTIQUEOS_CLIENT_ID and BOUTIQUEOS_CLIENT_SECRET must be set");
  const auth = {Authorization: `Basic ${Buffer.from(`${env.BOUTIQUEOS_CLIENT_ID}:${env.BOUTIQUEOS_CLIENT_SECRET}`).toString("base64")}`};
  const prev = await previousDeploy();
  const m = await request(`${base}/storefront/v1/manifest`, {...auth, ...(prev?.catalog_version != null ? {"If-None-Match": `"v${prev.catalog_version}"`} : {})});
  if (m.status === 304 && skipIfUnchanged) { console.log(`catalog unchanged at v${prev.catalog_version}`); await setOutput({changed: "false", version: prev.catalog_version}); return; }
  manifest = m.body || prev;
  catalog = (await request(`${base}/storefront/v1/catalog`, auth)).body;
  validate(catalog, manifest);
  const before = prev?.counts?.published, now = catalog.products.length;
  if (before && now < before / 2 && env.ALLOW_LARGE_DROP !== "true") fail(`product count fell from ${before} to ${now}; not deploying (set ALLOW_LARGE_DROP=true to override)`);
  siteConfig = {apiBaseUrl: base, ...(env.BOUTIQUEOS_PUBLISHABLE_KEY ? {publishableKey: env.BOUTIQUEOS_PUBLISHABLE_KEY} : {})};
}

const dataDir = path.join(out, "data");
await mkdir(dataDir, {recursive: true});
const versionInfo = {...(manifest || {}), catalog_version: catalog.catalog_version, counts: {...(manifest?.counts || {}), published: catalog.products.length}, synced_at: new Date().toISOString()};
await writeFile(path.join(dataDir, "catalog.json"), JSON.stringify(catalog));
await writeFile(path.join(dataDir, "manifest.json"), JSON.stringify(versionInfo, null, 2));
await writeFile(path.join(dataDir, "site-config.json"), JSON.stringify(siteConfig, null, 2));
console.log(`wrote ${catalog.products.length} products, catalog v${catalog.catalog_version}, to ${dataDir}`);
await setOutput({changed: "true", version: catalog.catalog_version});
}

main().catch(err => {
  console.error(`sync-catalog: ${err instanceof SyncFailure ? err.message : err.stack}`);
  process.exitCode = 1;
});
