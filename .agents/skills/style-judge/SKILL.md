---
name: style-judge
description: Have a fresh subagent review a change's diff for comments, tests, names, readability and fit with the repository, and fix what it finds in place. Use before committing a change, or when asked to review or tidy a diff.
---

# Style judge

A reviewer who didn't write the change sees what its author no longer can. Start a fresh subagent (the Agent tool in Claude Code) with the prompt below, so it judges only the diff and not the session that produced it. If you can't start one, follow the prompt yourself, reading only the diff.

## Prompt

Fill in the branch and the checkout path:

> You are a strict style judge for the change on branch `<branch>` in `<path>`. Review only `git diff origin/trunk...HEAD`, uncommitted changes (`git diff HEAD`) and the untracked files that belong to the change (`git status`); leave unrelated files alone. You don't know how the change was built; judge it as a reviewer would.
>
> Fix every problem directly in the lines the change adds or modifies, then report. Leave code the change didn't touch as it is. Rules, in priority order:
>
> 1. **Comments.** Follow the Conventions section of `AGENTS.md`. Remove comments that narrate the change or why it was made (`// Added to fix X`, `// Changed from Y to Z`) or restate the code; that belongs in the PR description. Keep a comment a future reader needs: non-obvious rationale, a gotcha, a link to context. Match the comment density of the surrounding code.
> 2. **Tests.** For each test the change adds, name the regression it would catch in behavior a user or a caller can observe. Delete it if you can't, or if it asserts on implementation: internal helpers, test IDs, CSS classes, config shapes, call order, or mocks being called. Merge narrow new tests into one behavior-level test where you can. In an existing test the change edits, judge only the edit. For Dashboard tests, follow `.claude/rules/dashboard-testing.md`.
> 3. **Names.** Each variable, function, prop and file name says what it holds or does. No vague names (`data`, `info`, `handle`, `temp`, `item2`), and no name the change made untrue.
> 4. **Readability.** Someone new to the file can follow it top to bottom. Flatten needless nesting, and remove dead code, debug leftovers, unused imports and abstractions used once.
> 5. **Fit.** Follow the structure and idiom of sibling files and the `AGENTS.md` nearest each changed file. Reuse an existing helper, component or design token instead of adding a new one.
> 6. **No shortcuts.** Flag, without fixing, each `as any`, `@ts-ignore`, `@ts-expect-error` or `eslint-disable` the change adds, each error it swallows, and each hardcoded color, size or string that should come from existing tokens, config or translations. Fixing these can change behavior, so the author decides.
>
> Don't change behavior and don't add tests. Preserve curly quotes and apostrophes exactly.
>
> Report one line per fix: `path:line` — rule — what was wrong → what you changed. Then list what you flagged but didn't fix, and why. End with `VERDICT: NEEDS ANOTHER PASS` if another judge could fix more, otherwise `VERDICT: CLEAN`.

## After it returns

- Check that each fix kept behavior the same, and revert any that didn't. Resolve each flagged item: fix it, or justify it in the PR description.
- Re-run the lint and unit tests from [verify](../verify/SKILL.md) for the files it touched.
- On `NEEDS ANOTHER PASS`, start one more fresh judge, then stop. List anything left under the PR's Details.
