Synthèse veille tech — 16 juin 2026

## Agents & outillage IA dev

• [VIGILANCE] Depuis le 15 juin, l'usage *programmatique* de Claude (Agent SDK, `claude -p`,
  GitHub Actions, agents tiers) bascule sur un pool de crédits mensuel séparé de l'abonnement,
  facturé au tarif API. Pro 20 $, Max 5x 100 $, Max 20x 200 $ — non reportables.
  → Impacte DIRECTEMENT cette veille auto : ton `claude -p` quotidien consomme ce pool (ou ta
    clé API en pay-as-you-go). Chiffre le coût/run — ici ~7 $/mois en Sonnet, une petite ligne.
  https://enterprisedna.co/resources/news/anthropic-claude-june-15-retirements-billing-2026/

• Le 15 juin aussi : retrait des modèles Claude 4 d'origine de l'API
  (claude-sonnet-4-20250514, claude-opus-4-20250514) → migrer vers sonnet-4-6 / opus-4-8.
  → Vérifie que le `--model` du workflow ne vise pas un modèle retiré. Le bundle est sur
    `claude-sonnet-4-6` (modèle courant, ~40 % moins cher qu'Opus pour ce type de tâche), donc OK.
  https://enterprisedna.co/resources/news/anthropic-claude-june-15-retirements-billing-2026/

• Release Claude Code (il y a ~16 h) : règles de permission plus fines via la syntaxe
  `Tool(param:value)` avec wildcard (ex. bloquer les sous-agents Opus), skills en `.claude/`
  imbriqués, et auto mode où les sous-agents passent par le classifieur avant lancement.
  → La syntaxe `Tool(param:value)` raffine ton garde-fou `--allowedTools` : restriction au
    paramètre près, utile pour verrouiller un run non-supervisé.
  https://releasebot.io/updates/anthropic/claude-code

• La catégorie des agents de code (Claude Code, Cursor, Codex, Antigravity) a convergé sur un
  même blueprint « agent-first » ; Grok Build entre dans la bagarre sur le prix et les habitudes.
  → Peu d'impact archi immédiat. Signal : le différenciateur se déplace vers prix + intégration,
    plus la capacité brute. À garder en tête pour tes choix d'outillage équipe.
  https://thenewstack.io/claude-code-vs-cursor-vs-codex-vs-antigravity-2026/

## Front-end

• Le React Compiler est en prod : fin du `useMemo`/`useCallback` manuel, optimisation au build.
  Le débat archi 2026 se cristallise sur RSC + réactivité à base de signals + l'INP comme
  métrique qui sépare le bien-architecturé du reste.
  → Pour ton monorepo Nx/React : Compiler + RSC = le « ça change l'archi » ; les signals
    restent une alternative philosophique, pas un chemin de migration.
  https://www.netguru.com/blog/front-end-trends

---
Aperçu généré le 16 juin 2026 (sources web publiques). En prod, ce fichier `veille.md` est
régénéré chaque matin par le job — ceci est un exemple committé pour figer le format attendu.
