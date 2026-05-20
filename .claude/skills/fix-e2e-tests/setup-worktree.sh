#!/usr/bin/env bash
#
# Create the worktree used by .claude/skills/fix-e2e-tests/SKILL.md
# Step 5.1: fetches the PR's branch so PR_SHA is locally resolvable,
# creates a new branch + worktree at that SHA, and symlinks
# node_modules + .husky/_ from the main checkout so the pre-commit
# hook works in the worktree without re-running yarn install /
# husky install.
#
# Usage:
#   setup-worktree.sh <PR_SHA> <BRANCH> <WORKTREE_PATH> <TARGET_BRANCH>
#
# Paths are relative to the main checkout root, which the script
# discovers via `git rev-parse --show-toplevel`. The script runs as a
# single Bash invocation from the assistant's perspective, so internal
# mkdir / cd / etc. don't tickle Claude Code's sensitive-path or
# expansion-obfuscation heuristics the way inline assistant Bash calls
# would.
#
# Exit codes:
#   0  success
#   1  bad usage
#   2  not inside a git repo
#   3  prerequisite missing (node_modules or .husky/_ in main checkout)
#   *  git failure (propagated)

set -euo pipefail

if [ "$#" -ne 4 ]; then
	echo "Usage: $0 <PR_SHA> <BRANCH> <WORKTREE_PATH> <TARGET_BRANCH>" >&2
	exit 1
fi

PR_SHA="$1"
BRANCH="$2"
WORKTREE_PATH="$3"
TARGET_BRANCH="$4"

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
	echo "Not inside a git repo." >&2
	exit 2
}

# --- Prerequisites ---------------------------------------------------
# Both must exist so the symlinks below resolve to something real.
# node_modules is populated by `yarn install`; .husky/_ is regenerated
# by husky's postinstall (also triggered by `yarn install`). We never
# work around their absence by skipping the pre-commit hook
# (--no-verify) — fix the env, not the gate.
if [ ! -d "$REPO_ROOT/node_modules" ]; then
	echo "node_modules missing at $REPO_ROOT — run 'yarn install' first." >&2
	exit 3
fi
if [ ! -d "$REPO_ROOT/.husky/_" ]; then
	echo ".husky/_ missing at $REPO_ROOT — run 'yarn install' first (husky's postinstall regenerates it)." >&2
	exit 3
fi

cd "$REPO_ROOT"

# --- Fetch + create worktree ----------------------------------------
echo "Fetching origin/$TARGET_BRANCH so PR_SHA is locally resolvable..." >&2
git fetch origin "$TARGET_BRANCH"

echo "Creating worktree at $WORKTREE_PATH on new branch $BRANCH at $PR_SHA..." >&2
git worktree add -b "$BRANCH" "$WORKTREE_PATH" "$PR_SHA"

# --- Symlinks --------------------------------------------------------
# The worktree shares .git with the main checkout but has its own
# working tree, so anything yarn / husky generated locally isn't
# present. wp-calypso's pre-commit hook needs both:
#
#   .husky/pre-commit sources .husky/_/husky.sh, then runs:
#     yarn run install-if-no-packages && node bin/pre-commit-hook.js
#
# Missing either causes the commit to fail with an opaque error.
# Symlinks suffice because:
#   - Yarn Berry uses `nodeLinker: node-modules` (no PnP), so a
#     shared node_modules tree works across worktrees.
#   - husky's _/husky.sh is a plain shell include — no absolute-path
#     state that breaks when shared.
#
# Both target paths are covered by the repo's tracked .gitignore
# (`node_modules` and an explicit `.husky/_` entry), so `git add -A`
# from the worktree side won't accidentally stage them.
echo "Linking node_modules and .husky/_ from $REPO_ROOT..." >&2
ln -s "$REPO_ROOT/node_modules" "$WORKTREE_PATH/node_modules"
ln -s "$REPO_ROOT/.husky/_"     "$WORKTREE_PATH/.husky/_"

echo "Worktree ready: $WORKTREE_PATH" >&2
