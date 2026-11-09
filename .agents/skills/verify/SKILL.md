---
name: verify
description: Verify a change works before calling it done or opening a PR — type-check, lint, unit tests and, for anything users can see, a logged-in check in the local dev server with screenshots and console and API errors. Use when asked to verify, check, test, screenshot or explore a change or a page.
---

# Verify

Prove the change works with evidence, not by reading the code. Pick the checks that fit the change and report what each one showed.

## 1. Static checks

- **Types.** `yarn typecheck-client`, `yarn typecheck-packages` or `yarn typecheck-apps`, for the code you touched. If it runs out of memory, prefix `NODE_OPTIONS=--max-old-space-size=12288`. If it fails on a package with no `dist/` yet, build it first (`cd packages/<name> && yarn build`).
- **Lint** only the files you changed: `yarn eslint <files>`, `yarn stylelint <files>` for styles.

## 2. Unit tests

Run the tests next to the code you changed (commands in AGENTS.md), and add or update tests when behavior changed.

## 3. Browser check

For anything users can see (UI, copy, translatable strings, or data the UI shows), follow [browser.md](browser.md).

Check the state the change is about, not just that the page loads. For a bug fix, reproduce the bug on `trunk` first if you can, so you know the check would catch it.

## 4. Report

Say what you ran, what it showed, and what you couldn't check. The screenshots are the before/after screenshots `create-pr` asks for.
