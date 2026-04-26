# Code Review Instructions (General)

## Primary Objective

Review the PR against Calypso's general guidelines in the following documentation files:

- @AGENTS.md
- @client/AGENTS.md

If the PR changes shared code (e.g. `client/state`, `client/components`), consider impact across clients and call it out.

## Method

- Do NOT try to list recent PRs when reviewing - you do not have permission to do so.
- Use `mcp__github_inline_comment__create_inline_comment` to post feedback directly on specific lines.
- Provide fix suggestions in each comment.
- Don't nitpick minor style issues unless they violate the documented guidelines.
- Before suggesting alternative implementations, check if the PR description already addresses why that approach wasn't used.

## Output Format

- Be concise.
- Do NOT use checkboxes, todo lists, or progress indicators.
- Only comment if there are issues worth addressing.
- DO NOT comment on lines that are not related to the guidelines listed above.
- For each comment, cite the source documentation file as a clickable link in the format of `https://github.com/Automattic/wp-calypso/blob/trunk/<path to the file relative to the project>`.
- For each comment, quote the specific sentence(s) from the cited source that justifies the comment, in a blockquote.

Remember: Calypso prioritizes performance, accessibility, and maintainability while leveraging modern React patterns.
