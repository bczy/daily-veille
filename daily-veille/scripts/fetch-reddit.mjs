// Récupère les posts du jour d'un ou plusieurs custom feeds Reddit (multireddits)
// publics, via leur endpoint JSON (pas d'auth), et écrit reddit-content.md.
// Si un feed est privé (403) ou indisponible → on note et on continue : la veille part quand même.
import { readFile, writeFile } from "node:fs/promises";

const OUT = "reddit-content.md";
const LIMIT = 25;   // posts récupérés par feed
const KEEP = 12;    // posts gardés au total (les mieux notés)
const MAX_CHARS = 600;
const UA = "daily-veille/1.0 (personal digest bot)";

async function loadFeeds() {
  try {
    const raw = await readFile("reddit-feeds.txt", "utf8");
    return raw.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  } catch {
    return [];
  }
}

function jsonUrl(feed) {
  // normalise : enlève query + slash final, force www, ajoute top.json du jour
  const base = feed.split("?")[0].replace(/\/+$/, "").replace("://reddit.com", "://www.reddit.com");
  return `${base}/top.json?t=day&limit=${LIMIT}`;
}

async function fetchFeed(feed) {
  const res = await fetch(jsonUrl(feed), { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${feed}`);
  const data = await res.json();
  return (data?.data?.children ?? []).map((c) => c.data).filter(Boolean);
}

function fmt(p) {
  const link = `https://www.reddit.com${p.permalink}`;
  const body = (p.selftext ?? "").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHARS);
  return `### ${p.title}\n_r/${p.subreddit} · ${p.score ?? 0} pts · ${p.num_comments ?? 0} comm._\n${body ? body + "\n" : ""}${link}\n`;
}

async function main() {
  const feeds = await loadFeeds();
  if (feeds.length === 0) {
    await writeFile(OUT, "(aucun feed Reddit configuré dans reddit-feeds.txt)\n");
    console.log("Aucun feed Reddit configuré — étape ignorée.");
    return;
  }

  const all = [];
  for (const feed of feeds) {
    try {
      all.push(...(await fetchFeed(feed)));
    } catch (e) {
      console.error("Feed KO :", e.message);
    }
  }

  if (all.length === 0) {
    await writeFile(OUT, "(aucun post Reddit récupéré — feed vide, privé, ou indisponible)\n");
    console.log("0 post Reddit.");
    return;
  }

  const top = all.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, KEEP);
  await writeFile(OUT, top.map(fmt).join("\n---\n\n"));
  console.log(`${top.length} post(s) Reddit → ${OUT}`);
}

main().catch(async (err) => {
  console.error("Erreur Reddit (on continue sans) :", err?.message ?? err);
  await writeFile(OUT, "(Reddit indisponible ce matin)\n").catch(() => {});
  process.exit(0);
});
