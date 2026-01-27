#!/bin/bash
# Run all verification checks for client/dashboard
# Usage: all.sh [--changed-only] [--fix]
set -e

DIR="$(dirname "$0")"

echo "=== Lint ===" && "$DIR/lint.sh" "$@"
echo "=== Format ===" && "$DIR/format.sh" "$@"
echo "=== Test ===" && "$DIR/test.sh" "$@"
echo "=== CSS ===" && "$DIR/css.sh" "$@"
echo "✅ All checks passed"
