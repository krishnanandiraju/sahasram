import {cp, mkdir, rm} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
await rm(dist, {recursive:true, force:true});
await mkdir(dist, {recursive:true});
for (const entry of ["index.html", "admin.html", "styles.css", "src"]) {
  await cp(new URL(`../${entry}`, import.meta.url), new URL(`../dist/${entry}`, import.meta.url), {recursive:true});
}
console.log("Built static site in dist/.");
