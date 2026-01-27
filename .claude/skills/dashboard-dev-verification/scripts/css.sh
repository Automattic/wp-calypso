#!/bin/bash
# Lint CSS/SCSS files in client/dashboard
# Usage: css.sh [--changed-only] [--fix] [files...]
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
    yarn lint:css $FIX "${FILES[@]}"
elif $CHANGED_ONLY; then
    files=$("$DIR/changed-files.sh" css | tr '\n' ' ')
    if [ -n "$files" ]; then
        npx stylelint $FIX $files
    else
        echo "No changed CSS/SCSS files"
    fi
else
	  echo "Must use --changed-only, --fix, or specify files" >&2
		exit 1
fi
