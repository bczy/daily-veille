#!/usr/bin/env bash
set -euo pipefail

# À LANCER PAR TOI, dans le dossier du bundle décompressé.
# Le repo bczy/daily-veille existe déjà → on pousse dedans.
# Auth = TON gh / TON credential helper / TON token. Ce script ne lit aucun
# fichier de secrets et n'embarque aucun token.

git init -b main
git add .
git commit -m "feat: veille tech quotidienne (Claude Code headless + envoi SMTP Gmail)"
git remote add origin https://github.com/bczy/daily-veille.git
git push -u origin main

echo "→ https://github.com/bczy/daily-veille"

# Si tu as créé le repo AVEC un README (donc non vide), le push sera refusé.
# Deux options dans ce cas :
#   git pull --rebase origin main   # tu récupères le README puis tu repousses
#   # ou, si tu veux que le bundle écrase (repo quasi vide de toute façon) :
#   git push -u origin main --force
