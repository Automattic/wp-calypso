#!/bin/bash
# Lint JS/TS files in client/dashboard
# Usage: lint.sh [--changed-only] [--fix] [files...]
# Examples:
#   lint.sh --changed-only       # lint changed files
#   lint.sh --fix                # lint all with autofix
#   lint.sh path/to/file.ts      # lint specific file
set -e

DIR="$(dirname "$0")"
FIX=""
CHANGED_ONLY=false
FILES=()

for arg in "$@"; do
    case $arg in
        --fix) FIX="--fix" ;;
        --changed-only) CHANGED_ONLY=true ;;
        *) FILES+=("$arg") ;;
    esac
done

if [ ${#FILES[@]} -gt 0 ]; then
    yarn lint:js $FIX "${FILES[@]}"
elif $CHANGED_ONLY; then
    files=$("$DIR/changed-files.sh" js | tr '\n' ' ')
    if [ -n "$files" ]; then
        npx eslint $FIX $files
    else
        echo "No changed JS/TS files"
    fi
else
	  echo "Must use --changed-only, --fix, or specify files" >&2
		exit 1
fi
