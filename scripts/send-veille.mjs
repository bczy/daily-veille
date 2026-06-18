// Envoi de la veille par SMTP. Aucune donnée en dur : tout via variables d'env.
// Usage : node scripts/send-veille.mjs [chemin-fichier]   (défaut: veille.md)
import { readFile } from "node:fs/promises";
import nodemailer from "nodemailer";

const file = process.argv[2] ?? "veille.md";
const body = (await readFile(file, "utf8")).trim();

if (!body) {
  console.error(`Fichier ${file} vide — rien à envoyer.`);
  process.exit(1);
}

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  MAIL_TO,
} = process.env;

if (!SMTP_HOST || !MAIL_TO) {
  console.error("SMTP_HOST et MAIL_TO sont requis.");
  process.exit(1);
}

const port = Number(SMTP_PORT);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465, // 465 = TLS implicite ; 587 = STARTTLS
  // auth omis si le relais interne fait du relai sans authent (cas fréquent en corpo)
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

const date = new Date().toISOString().slice(0, 10);

const info = await transporter.sendMail({
  from: MAIL_FROM ?? SMTP_USER,
  to: MAIL_TO,
  subject: "synthèse veille tech du jour",
  text: body,
});

console.log(`Veille du ${date} envoyée à ${MAIL_TO} — id ${info.messageId}`);
