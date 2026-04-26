# Code Review Instructions (General)

## Primary Objective

Review the PR against Calypso's authoritative guidelines:

- @AGENTS.md (top-level: architecture, deprecations, PR hygiene)
- @client/AGENTS.md (client conventions: i18n, components, TypeScript, CSS, testing)
- Any AGENTS.md or README in the paths the diff touches

If the diff touches shared infrastructure (`client/state`, `client/components`, `client/lib`, `client/layout`, or `packages/**`), call out cross-client blast radius. Calypso, Jetpack Cloud, and A4A all consume these.

## Review focus (when applicable to the diff)

1. **Backwards compatibility.** Exported function/component prop signatures, public hook contracts (`use*`), Redux action/selector shapes, REST endpoint shapes, persisted state schema. Breaking changes must be intentional and called out.

2. **Auth and authz.** Capability checks before admin UI, route guards, `canCurrentUser` selectors, CSRF/nonce headers on mutating fetches, IDOR via author-controlled IDs.

3. **Web-app security.** `dangerouslySetInnerHTML`, `href={userUrl}` with untrusted protocols (`javascript:`, `data:`), event-handler interpolation, `target="_blank"` without `rel="noopener"`.

4. **Injection / XSS.** Untrusted input in templates, log lines, shell calls, fetch URLs. Validate after decode/canonicalize, not before.

5. **Type safety.** Unjustified `any` or `as`, loose `==` on user data, `Object.assign` or spread of attacker-controlled JSON (prototype pollution via `__proto__`).

6. **Resource and DoS.** Unanchored regexes on user input (ReDoS), unbounded arrays/strings from API responses, missing `useMemo`/`useCallback`, network waterfalls, missing `select` memoization in `@wordpress/data`.

7. **Information disclosure.** Tokens or PII in `console.log`, stack traces in client-visible error responses, analytics payloads.

8. **Supply chain.** Only when the diff touches `.github/workflows/`: `pull_request_target` + PR-branch checkout, `${{ ... }}` interpolation in `run:` with attacker-controllable values, unpinned third-party actions.

9. **Regression prevention.** If the diff touches a path that has prior security fixes (per `git log --oneline` on those files), flag for extra scrutiny.

10. **Architecture awareness.** Calypso has two architectures: classic (Redux + page.js, mostly under `client/my-sites/`, deprecated) and Dashboard (TanStack Query + TanStack Router, under `client/dashboard/`). Flag patterns from one bleeding into the other; question new feature work in the deprecated half.

## Method

- Read prior Copilot/human/bot comments before posting your own. Validate concerns by tracing code, not just the diff.
- Use `mcp__github_inline_comment__create_inline_comment` for line-specific feedback.
- DO NOT post a comment if Copilot or an earlier review already covers the same line within 5 lines (dedupe).
- For diffs over ~2000 lines: focus on security-sensitive code, public APIs, and shared infra. Skip cosmetic or generated files.
- Skip entirely: `node_modules/**`, `build/**`, `dist/**`, `**/*.min.*`, `**/*.map`, snapshot files, generated types, `*.po`/`*.mo`.
- Don't nitpick minor style unless it violates a documented guideline.
- Before suggesting alternative implementations, check if the PR description already explains the choice.
- If the diff is straightforward, review it directly. Don't over-explore.

## Output

- Be concise. Only post if there are real issues.
- DO NOT use checkboxes, todo lists, or progress indicators.
- Each comment shape: `**Issue:** <one-line problem>` then `**Suggestion:** <fix>`. Cite the source documentation as a clickable link `https://github.com/Automattic/wp-calypso/blob/trunk/<path>` and blockquote the specific sentence(s) that justify the comment.
- If you reviewed prior concerns, classify them: RESOLVED / STILL OUTSTANDING / NEW. Post inline only for NEW; mention RESOLVED/OUTSTANDING in a single summary comment.
- If everything looks good, post a brief summary saying so. Don't silently skip.
