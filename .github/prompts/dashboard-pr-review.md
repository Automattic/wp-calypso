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

- Use `mcp__github_inline_comment__create_inline_comment` to post feedback directly on specific lines.
- Provide fix suggestions in each comment.
- Don't nitpick minor style issues unless they violate project guidelines.
- Before suggesting alternative implementations, check if the PR description already addresses why that approach wasn't used.

## Output Format

- Be concise.
- Do NOT use checkboxes, todo lists, or progress indicators.
- Only comment if there are issues worth addressing.
