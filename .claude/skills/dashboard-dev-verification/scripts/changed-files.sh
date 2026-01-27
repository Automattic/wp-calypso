#!/bin/bash
# Output changed files in client/dashboard (staged + unstaged)
# Usage: changed-files.sh [js|css|all]
# Example: changed-files.sh js | xargs yarn lint:js

DASHBOARD_PATH="client/dashboard"
TYPE="${1:-all}"

files=$({ git diff --name-only HEAD -- "$DASHBOARD_PATH" 2>/dev/null; git diff --cached --name-only -- "$DASHBOARD_PATH" 2>/dev/null; } | sort -u)

case "$TYPE" in
    js)
        echo "$files" | grep -E '\.(js|jsx|ts|tsx|mjs|json)$' || true
        ;;
    css)
        echo "$files" | grep -E '\.(css|scss)$' || true
        ;;
    all)
        echo "$files"
        ;;
    *)
        echo "Usage: changed-files.sh [js|css|all]" >&2
        exit 1
        ;;
esac
