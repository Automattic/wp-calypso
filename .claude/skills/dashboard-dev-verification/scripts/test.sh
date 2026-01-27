#!/bin/bash
# Run Jest tests for client/dashboard
# Usage: test.sh [--changed-only] [files...]
set -e

DIR="$(dirname "$0")"
CHANGED_ONLY=false
FILES=()

for arg in "$@"; do
    case $arg in
        --changed-only) CHANGED_ONLY=true ;;
        *) FILES+=("$arg") ;;
    esac
done

if [ ${#FILES[@]} -gt 0 ]; then
    yarn test-client --testPathPattern="client/dashboard" --findRelatedTests ${FILES[@]}
elif $CHANGED_ONLY; then
    files=$("$DIR/changed-files.sh" js | tr '\n' ' ')
    if [ -n "$files" ]; then
        yarn test-client --testPathPattern="client/dashboard" --findRelatedTests $files
    else
        echo "No changed JS/TS files"
    fi
else
    echo "Must use --changed-only, --fix, or specify files" >&2
    exit 1
fi
