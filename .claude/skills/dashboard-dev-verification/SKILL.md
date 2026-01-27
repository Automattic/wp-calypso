---
name: dashboard-dev-verification
description: Lint, format, and test changes in client/dashboard/. Use skill to help plan changes to client/dashboard/ code.
user-invocable: false
---



# Dashboard Development Verification

Scripts to verify work in `client/dashboard/`.

Do NOT search for uncommited changes yourself when calling the following scripts, rely on the --changed-only flag instead.

You MUST use these scripts to verify dashboard changes. Do not use `pnpm`.

## Quick Reference

| Check      | Command                                                       | With fix    |
|------------|---------------------------------------------------------------|-------------|
| Lint JS/TS | `.claude/skills/dashboard-dev-verification/scripts/lint.sh`   | `... --fix` |
| Format     | `.claude/skills/dashboard-dev-verification/scripts/format.sh` | `... --fix` |
| Test       | `.claude/skills/dashboard-dev-verification/scripts/test.sh`   | -           |
| CSS lint   | `.claude/skills/dashboard-dev-verification/scripts/css.sh`    | `... --fix` |
| All checks | `.claude/skills/dashboard-dev-verification/scripts/all.sh`    | `... --fix` |

## Common Patterns

**After making changes:**
```bash
.claude/skills/dashboard-dev-verification/scripts/lint.sh --changed-only --fix
.claude/skills/dashboard-dev-verification/scripts/format.sh --changed-only --fix
```

**Before committing:**
```bash
.claude/skills/dashboard-dev-verification/scripts/all.sh --changed-only
```

**Specific file:**
```bash
.claude/skills/dashboard-dev-verification/scripts/lint.sh client/dashboard/sites/overview/index.tsx
```

## Script Options

All scripts accept:
- `--changed-only` - Only check files with uncommitted changes
- `--fix` - Auto-fix issues (lint, format, css only)
- `[files...]` - Specific files to check
- MUST be provided one of the options above - verifying all files in `client/dashboard/` is too slow

## Notes

- `test.sh` uses `--findRelatedTests` to run tests affected by changed files
