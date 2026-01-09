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

## If No Issues Found

State: "No significant issues detected" with a brief explanation.