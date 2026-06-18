// Récupère les newsletters récentes (dernières 24 h) des expéditeurs listés dans
// newsletter-senders.txt, via IMAP en lecture seule, et écrit leur texte dans
// newsletters-content.md (consommé ensuite par le prompt de veille).
//
// Réutilise le compte Gmail + mot de passe d'application (mêmes SMTP_USER / SMTP_PASS).
// Résilient : en cas d'erreur ou d'absence de newsletter, écrit une note et sort en 0
// pour ne pas casser la génération de la veille.
import { readFile, writeFile } from "node:fs/promises";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { convert } from "html-to-text";

const OUT = "newsletters-content.md";
const MAX_CHARS_PER_MAIL = 1800; // borne le coût en tokens
const SINCE = new Date(Date.now() - 24 * 60 * 60 * 1000);

async function loadSenders() {
  try {
    const raw = await readFile("newsletter-senders.txt", "utf8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  } catch {
    return [];
  }
}

function clean(parsed) {
  const text =
    parsed.text ??
    (parsed.html
      ? convert(parsed.html, {
          wordwrap: 0,
          selectors: [
            { selector: "a", options: { ignoreHref: true } },
            { selector: "img", format: "skip" },
          ],
        })
      : "");
  return text.replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHARS_PER_MAIL);
}

async function main() {
  const senders = await loadSenders();
  if (senders.length === 0) {
    await writeFile(OUT, "(aucun expéditeur configuré dans newsletter-senders.txt)\n");
    console.log("Aucun expéditeur configuré — étape ignorée.");
    return;
  }

  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    await writeFile(OUT, "(identifiants IMAP manquants)\n");
    console.log("SMTP_USER / SMTP_PASS absents — étape ignorée.");
    return;
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    logger: false,
  });

  const blocks = [];
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    for (const sender of senders) {
      const uids = await client.search({ since: SINCE, from: sender }, { uid: true });
      if (!uids || uids.length === 0) continue;
      for await (const msg of client.fetch(uids, { source: true, envelope: true }, { uid: true })) {
        const date = msg.envelope?.date ? new Date(msg.envelope.date) : null;
        if (date && date < SINCE) continue; // affine : IMAP "since" est au jour près
        const parsed = await simpleParser(msg.source);
        const subject = parsed.subject ?? "(sans objet)";
        const from = parsed.from?.text ?? sender;
        const body = clean(parsed);
        if (!body) continue;
        blocks.push(`### ${subject}\n_De : ${from}_\n\n${body}\n`);
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }

  if (blocks.length === 0) {
    await writeFile(OUT, "(aucune newsletter sur les dernières 24 h)\n");
    console.log("0 newsletter trouvée.");
    return;
  }

  await writeFile(OUT, blocks.join("\n---\n\n"));
  console.log(`${blocks.length} newsletter(s) récupérée(s) → ${OUT}`);
}

main().catch(async (err) => {
  console.error("Erreur IMAP (on continue sans newsletters) :", err?.message ?? err);
  await writeFile(OUT, "(newsletters indisponibles ce matin — erreur de récupération)\n").catch(() => {});
  process.exit(0); // ne casse pas la veille
});
