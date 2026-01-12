# Dashboard PR Screenshots

Capture before/after screenshots of dashboard routes affected by your PR changes.

## Quick Start

```bash
# Auto-detect routes from changed files
/dashboard-pr-screenshots

# Specify routes manually
/dashboard-pr-screenshots /sites/example.com /me/profile

# With mobile viewport
/dashboard-pr-screenshots --viewport mobile
```

## What It Does

1. Detects which dashboard routes are affected by your changes
2. Captures screenshots from trunk (before) and your branch (after)
3. Updates your PR description with a visual comparison table

## Requirements

- You must have an active PR for the current branch
- The `gh` CLI must be authenticated
- Changes must be in `client/dashboard/**`
