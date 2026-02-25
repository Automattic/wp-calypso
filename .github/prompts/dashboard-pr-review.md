# Code Review Instructions

## Primary Objective

Review the PR based on the following files:

- @packages/api-core/README.md
- @packages/api-queries/README.md
- @client/dashboard/docs/data-library.md
- @client/dashboard/docs/i18n.md
- @client/dashboard/docs/links.md
- @client/dashboard/docs/package-imports.md
- @client/dashboard/docs/router.md
- @client/dashboard/docs/testing.md
- @client/dashboard/docs/typography-and-copy.md
- @client/dashboard/docs/ui-components.md

## Method

- Use `mcp__github_inline_comment__create_inline_comment` to post feedback directly on specific lines.
- Provide fix suggestions in each comment.
- Don't nitpick minor style issues unless they violate project guidelines.
- Before suggesting alternative implementations, check if the PR description already addresses why that approach wasn't used.

## Output Format

- Be concise.
- Do NOT use checkboxes, todo lists, or progress indicators.
- Only comment if there are issues worth addressing.
- DO NOT comment on lines that are not related to the guidelines.

Remember: This dashboard represents modern React patterns. Prioritize performance, accessibility, and maintainability while leveraging the WordPress ecosystem.
