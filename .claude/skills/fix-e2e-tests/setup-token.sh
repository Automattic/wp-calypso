#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$HOME/.config/teamcity-access-token"

# Refuse to run under Claude Code's `!` prefix (or any non-TTY stdin).
# In that environment, Claude Code echoes user input into the chat no matter
# what `read -s` does, so the token would leak into the conversation transcript.
if [ ! -t 0 ] || [ ! -t 1 ]; then
	cat >&2 <<'EOF'
This script must be run in a real terminal, not via Claude Code's `!` prefix.

Claude Code captures and renders all input sent to `!` commands — including
input you intended for a hidden password prompt. Running this way would leak
your TeamCity token into the conversation transcript.

To continue:

  1. Open a separate terminal window (your normal terminal, not Claude Code).
  2. cd to the wp-calypso repo.
  3. Run:  bash .claude/skills/fix-e2e-tests/setup-token.sh
  4. Paste your token at the hidden prompt.
  5. Return to Claude Code and say "done".
EOF
	exit 2
fi

mkdir -p "$HOME/.config"

printf 'Paste your TeamCity access token (input hidden): '
IFS= read -rs token
printf '\n'

if [ -z "${token:-}" ]; then
	echo "No token entered. Nothing written." >&2
	exit 1
fi

umask 077
printf 'TEAMCITY_TOKEN=%s\n' "$token" > "$ENV_FILE"
chmod 600 "$ENV_FILE"
unset token

echo "Saved to $ENV_FILE (0600). Return to Claude Code and say \"done\"."
