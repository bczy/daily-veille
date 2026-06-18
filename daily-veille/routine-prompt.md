# Prompt pour Routine Claude Code

À coller dans une Routine (claude.ai/code/routines, app desktop, ou CLI `/schedule`).
Déclencheur conseillé : **daily**, en semaine, le matin.

Le prompt de veille lui-même est identique à `prompts/veille.md` — copie son contenu.

Ajoute en tête du prompt la ligne de sortie adaptée au connecteur disponible, car
**le connecteur Gmail ne sait que créer un brouillon, pas envoyer**. Choisis une cible :

- **Google Drive** (recommandé si Routine) :
  « Écris la synthèse dans un nouveau Google Doc nommé `Veille tech <date>` dans le dossier <ID/chemin>. »

- **Slack** :
  « Poste la synthèse dans le canal #veille-tech. »

- **Dépôt GitHub** :
  « Commit la synthèse dans `veille/veille-<date>.md` sur la branche `veille` et ouvre/mets à jour la PR « Veille tech ». »

## Limites à connaître (research preview)

- Exécution sur le cloud Anthropic, en research preview.
- Plafonds quotidiens par plan : Pro 5, Max 15, Team/Enterprise 25 runs/jour.
- Comportement et limites susceptibles d'évoluer.

→ Pour une livraison **par mail**, utilise plutôt la variante GitHub Action (voir README).
