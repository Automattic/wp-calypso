# Code Review Instructions (A4A)

## Primary Objective

Review the PR against the Automattic for Agencies (A4A) guidelines in the following documentation files:

- @AGENTS.md
- @client/AGENTS.md
- @client/a8c-for-agencies/AGENTS.md

If other shared packages or docs are directly referenced in the PR description, treat them as additional guidance, but prioritize the files above.

If the PR changes shared code (e.g. `client/state`, `client/components`), consider impact on both A4A and other clients and call it out.

## Review focus (when applicable)

- **Feature flags:** Only when the feature is already behind a feature flag in A4A — flag if new behaviour bypasses or is not correctly wired into the existing flag where the rest of the codebase does so.
- **Translations:** New user-visible strings should use the project’s i18n approach; call out potentially missing translations or hardcoded copy.

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

Remember: A4A builds on Calypso client patterns. Prioritize performance, accessibility, and maintainability while following the A4A code style, layout, and typography guidance described in the referenced docs. We also use modern React patterns.
