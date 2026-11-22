import {cp, mkdir, rm, access} from "node:fs/promises";

// `npm run build` copies everything. `npm run build:public` leaves out the owner
// console, which has no login yet — this is what GitHub Pages publishes.
const publicOnly = process.argv.includes("--public");
const ownerOnly = new Set(["admin.html", "styles.css", "src/admin.js"]);

const dist = new URL("../dist/", import.meta.url);
await rm(dist, {recursive:true, force:true});
await mkdir(dist, {recursive:true});
for (const entry of ["index.html", "admin.html", "styles.css", "store.css", "favicon.svg", "src", "assets", "data"]) {
  if (publicOnly && ownerOnly.has(entry)) continue;
  const from = new URL(`../${entry}`, import.meta.url);
  try { await access(from); } catch { console.warn(`skipped missing ${entry}`); continue; }
  await cp(from, new URL(`../dist/${entry}`, import.meta.url), {
    recursive:true,
    filter: (src) => !(publicOnly && src.replaceAll("\\", "/").endsWith("/src/admin.js")),
  });
}
console.log(`Built ${publicOnly ? "public " : ""}static site in dist/.`);
