# Veille tech quotidienne

Projet perso : une « synthèse veille tech du jour » générée et envoyée par mail chaque matin,
sans dépendre de claude.ai en interactif (qui ne planifie rien et n'envoie pas de mail).

Envoi **depuis ton compte Gmail** (via `smtp.gmail.com`) **vers** ta boîte de destination
(ici `bertrand.coizy@edenred.com`, qui n'est qu'une adresse d'arrivée — aucun accès à quoi que ce soit côté destinataire).

```
daily-veille/
├── prompts/veille.md                  # le prompt de veille
├── routine-prompt.md                  # variante "Routine Claude Code" (cloud, zéro infra)
├── .github/workflows/veille-tech.yml  # variante "GitHub Action planifiée" (la cible)
├── scripts/send-veille.mjs            # envoi SMTP via ton Gmail
├── .env.example                       # variables pour un run manuel
└── package.json
```

## Option A — Routine Claude Code (proto rapide)

Le plus simple, zéro infra. Tu colles le prompt dans une Routine (`/schedule` en CLI,
ou claude.ai/code/routines), déclencheur **daily**.

- Sortie : Google Drive, Slack, ou commit dans un repo — **pas** un mail
  (le connecteur Gmail ne sait que brouillonner).
- Research preview, exécution sur le cloud Anthropic.
- Plafonds : 5 (Pro) / 15 (Max) / 25 (Team-Enterprise) runs par jour.

Bon pour tester/affiner le prompt avant de brancher l'envoi mail.

## Option B — GitHub Action planifiée (la cible : mail dans ta boîte)

Envoi via `smtp.gmail.com`, joignable depuis un runner GitHub hébergé.
**Pas besoin de self-hosted runner ni de cron local.**

### Secrets à créer (repo → Settings → Secrets and variables → Actions)

| Secret             | Valeur                                                  |
|--------------------|---------------------------------------------------------|
| `ANTHROPIC_API_KEY`| ta clé API Anthropic                                    |
| `SMTP_HOST`        | `smtp.gmail.com`                                        |
| `SMTP_PORT`        | `587`                                                   |
| `SMTP_USER`        | **ton adresse Gmail** (le compte qui envoie)            |
| `SMTP_PASS`        | **mot de passe d'application Google** (16 car., 2FA)    |
| `MAIL_FROM`        | **ton adresse Gmail** (Gmail force le From sur ce compte)|

Le destinataire est figé dans le workflow (`bertrand.coizy@edenred.com`) — change-le là si besoin.

### Le mot de passe d'application Google

Sur **ton compte Google perso**, tu maîtrises tout :

1. Compte Google → Sécurité → Validation en 2 étapes (doit être active).
2. « Mots de passe des applications » → en générer un, nommé p.ex. `daily-veille`.
3. Colle les 16 caractères dans le secret `SMTP_PASS`. C'est tout.

### Tester

`workflow_dispatch` est activé → lance le workflow à la main une fois pour valider
l'artefact `veille.md` puis l'arrivée du mail, avant de te fier au planning.

## Newsletters (en plus de la veille web)

Le job lit aussi tes newsletters Gmail et les synthétise dans une section dédiée du mail.

- **Aucune auth supplémentaire** : le mot de passe d'application Gmail (`SMTP_PASS`) sert
  aussi à la lecture IMAP (`imap.gmail.com`). Vérifie juste que l'IMAP est activé :
  Gmail → Paramètres → Transfert et POP/IMAP → Activer IMAP (souvent déjà actif).
- **Quels mails ?** Ceux des expéditeurs listés dans `newsletter-senders.txt`
  (une adresse par ligne, ce n'est pas un secret → committé). Remplis-le avec tes newsletters.
- Le script `scripts/fetch-newsletters.mjs` récupère les messages de ces expéditeurs reçus
  sur les dernières 24 h, en extrait le texte, et les passe à la synthèse. S'il n'y a rien
  (ou en cas d'erreur IMAP), la veille web est générée quand même.

## Reddit (custom feeds)

Le job lit aussi un ou plusieurs custom feeds Reddit (multireddits) et les synthétise.

- **Aucune auth** : les feeds publics ont un endpoint `.json` lu directement.
- **Quels feeds ?** Ceux listés dans `reddit-feeds.txt` (une URL par ligne, committé).
  Le script récupère le « top du jour » de chaque feed.
- ⚠️ Le feed doit être **public**. S'il est privé, l'endpoint renvoie 403 → ignoré
  proprement (la veille part quand même). Pour un feed privé il faudrait l'API Reddit en OAuth.

## Bon à savoir

- **Modèle** : `claude-sonnet-4-6` (bon rapport qualité/prix pour une synthèse). ~7 $/mois
  pour un run en semaine. Le `--model` se change en une ligne dans le workflow.
- **Garde-fou** : `--allowedTools "WebSearch"` limite l'agent à la recherche web
  (pas d'écriture, pas de bash). Élargis seulement si besoin.
- **Coût** : facturé à l'usage sur ta clé API (pas le pool d'abonnement). Le web search
  coûte 0,01 $/recherche en plus des tokens.
- **Secrets** : jamais en clair, le script n'imprime que l'id du message envoyé.
