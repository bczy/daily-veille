#!/usr/bin/env bash
set -euo pipefail

# À LANCER PAR TOI, après avoir rempli .env (qui n'est PAS commité).
# Crée les 6 secrets GitHub Actions du repo à partir de ton .env, via gh.
# Tes valeurs restent chez toi : rien ne transite par un tiers, ni par moi.
# Pré-requis : gh authentifié (gh auth status) sur le compte bczy.

REPO="bczy/daily-veille"

if [[ ! -f .env ]]; then
  echo "Pas de .env trouvé. Copie .env.example en .env et remplis-le d'abord." >&2
  exit 1
fi

# charge .env dans l'environnement
set -a; source .env; set +a

for var in ANTHROPIC_API_KEY SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS MAIL_FROM; do
  if [[ -z "${!var:-}" ]]; then
    echo "Variable $var vide dans .env — corrige avant de relancer." >&2
    exit 1
  fi
  gh secret set "$var" --repo "$REPO" --body "${!var}"
  echo "✓ $var"
done

echo "→ 6 secrets créés sur $REPO"
