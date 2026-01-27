#!/bin/bash
# Check formatting of JS/TS files in client/dashboard
# Usage: format.sh [--changed-only] [--fix] [files...]
set -e

DIR="$(dirname "$0")"
MODE="--check"
CHANGED_ONLY=false
FILES=()

for arg in "$@"; do
    case $arg in
        --fix) MODE="--write" ;;
        --changed-only) CHANGED_ONLY=true ;;
        *) FILES+=("$arg") ;;
    esac
done

if [ ${#FILES[@]} -gt 0 ]; then
    yarn prettier $MODE "${FILES[@]}"
elif $CHANGED_ONLY; then
    files=$("$DIR/changed-files.sh" js | tr '\n' ' ')
    if [ -n "$files" ]; then
        yarn prettier $MODE $files
    else
        echo "No changed JS/TS files"
    fi
else
    echo "Must use --changed-only, --fix, or specify files" >&2
    exit 1
fi
