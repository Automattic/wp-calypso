# Code Review Instructions

## Primary Objective

Review the dashboard code for quality, correctness, and best practices.

## Project Guidelines

Read `.cursor/rules/dashboard-rules.mdc` before reviewing.

## Scope

- **React/TypeScript**: Component props/types, hook dependencies, state management, error handling.
- **Performance**: Unnecessary re-renders, missing memoization, large bundle imports.
- **Accessibility**: Missing ARIA labels, keyboard navigation, focus management.
- **API usage**: Correct endpoint usage, error states, loading states.

## Method

- Use `mcp__github_inline_comment__create_inline_comment` for line-specific issues.
- Cite `file:line` for each issue.
- Provide fix suggestions.
- Focus on files changed in this PR.
- Don't nitpick minor style issues unless they violate project guidelines.
- Before suggesting alternative implementations, check if the PR description already addresses why that approach wasn't used.

## Output Format

- Be concise. Target 5-15 lines for most reviews.
- Do NOT use checkboxes, todo lists, or progress indicators.
- Do NOT use emoji headers (e.g., `### ✅ Section`), horizontal rules (`---`), or decorative formatting.
- Only mention issues; skip sections with nothing to report.
- For Dashboard Guidelines compliance: one sentence if passing (e.g., "Dashboard guidelines followed."), details only if violations found.
- For clean PRs: "LGTM - no issues found." with a brief explanation.