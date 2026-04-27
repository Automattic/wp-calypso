# Code Review Instructions (General)

## Primary Objective

Review the PR by reading the relevant `AGENTS.md` files AND applying the review-focus axes below. Always read at minimum:

- `AGENTS.md` (top-level: architecture, deprecations, PR hygiene, shared infra)
- `client/AGENTS.md` (i18n, components, TypeScript, CSS, testing conventions)
- The nearest `AGENTS.md` for each non-trivial path the diff touches (e.g., `client/reader/AGENTS.md`, `packages/help-center/AGENTS.md`).

If other shared packages or docs are referenced in the PR description, treat them as additional guidance but prioritize the AGENTS.md files above.

If the diff touches paths AGENTS.md identifies as shared infrastructure, call out cross-client blast radius (Calypso, Jetpack Cloud, A4A consume them).

## Non-goals

- Do NOT run tests, lint, or typecheck.
- Do NOT validate PR-description hygiene.
- Do NOT try to list recent PRs when reviewing - you do not have permission to do so.
- Do NOT comment on a line if a Copilot or earlier review already covers the same issue within 5 lines.

## Review focus

For each axis, only flag when the trigger pattern matches the diff. Provide a fix suggestion in each comment.

**1. Backwards compatibility.** Flag when the diff changes an exported function/component prop signature, public hook contract (`use*`), Redux action/selector shape, REST endpoint shape, or persisted state schema.
Message: `Breaking change to public API at <symbol>. <Specifics>. Confirm intentional and called out in PR description.`

**2. Auth and authz.** Flag missing capability checks, route guards, or CSRF/nonce headers; IDOR on new path-param routes; mass assignment via spread of form/state into mutating fetches.
Message: `Missing <capability check | guard | CSRF header | authz check> at <location>. <Specific fix>.`

**3. Web-app security.** Flag `dangerouslySetInnerHTML` without sanitizer; `href={userUrl}` with attacker-controlled URL or `javascript:`/`data:` protocols; event-handler interpolation; open redirect via `router.push(req.query.next)` or similar; `postMessage` with `'*'` or no origin gate on receiver; `target="_blank"` without `rel="noopener"`.
Message: `<Specific risk> at <location>. <Specific fix>.`

**4. Injection / XSS.** Flag untrusted input flowing into HTML, template, `eval`, `Function`, shell calls (in scripts), or fetch URLs concatenated from input.
Message: `Untrusted input from <source> flows into <sink>. Validate after decode/canonicalize.`

**5. Type safety / prototype pollution.** Flag prototype pollution via `Object.assign`, recursive merge, or lodash `_.merge` on attacker-controlled JSON; `as` casts on `JSON.parse` or fetched JSON; loose `==` on user data; unjustified `any` (see `client/AGENTS.md`).
Message: `<Specific risk> at <location>. <Specific fix>.`

**6. Resource and DoS.** Flag ReDoS via unanchored regex on user input; unbounded loops over API responses; client-side state growth from streams/polling without bounds; missing `useMemo`/`useCallback` causing re-renders or network waterfalls.
Message: `<Specific risk> at <location>. <Specific fix>.`

**7. Information disclosure.** Flag tokens or PII in `console.log`, Sentry, or analytics payloads; stack traces in client-visible error responses. Calypso-internal IDs (`blog_id`, `studio_site_id`) are not PII.
Message: `<Field> in <log | Sentry | analytics> may leak <category>.`

**8. Supply chain.** Only when the diff touches `.github/workflows/`. Flag `pull_request_target` + PR-branch checkout, `${{ ... }}` interpolation in `run:` with attacker-controllable values, unpinned third-party actions.
Message: `<Specific risk> at <location>. <Specific fix>.`

**9. Architecture awareness.** Flag when the diff imports `page.js` inside `client/dashboard/`, uses `useDispatch` from `react-redux` inside `client/dashboard/`, or adds new feature work to `client/my-sites/` (deprecated per AGENTS.md).
Message: `<Pattern> bleeds <classic | dashboard> into <other>. <Suggested approach>.`

**10. Route deletion → redirect.** Flag when the diff removes a `<Route>` declaration or a route handler with a previously-shipped path.
Message: `Route <path> deleted. Add a redirect for users with bookmarks if the route had been live.`

**11. Shared-package consumer audit.** Flag when the diff changes a public export in `packages/**`. Grep `apps/**` and `client/**` for imports.
Message: `<package> is consumed by <list apps>. Verify the change is compatible.`

## Output Format

- Be concise. Only comment if a trigger matched.
- Each comment shape: `**Issue:** <one-line problem>` then `**Suggestion:** <fix>`.
- DO NOT comment on lines that are not related to the guidelines listed above.
- Don't nitpick minor style issues unless they violate the documented guidelines.
- Cite the source documentation as a clickable link when AGENTS.md or a project README covers the issue (`https://github.com/Automattic/wp-calypso/blob/trunk/<path>`); blockquote the relevant sentence. For security categories not in repo docs, name the axis from this prompt and add a one-line rationale; do not fabricate doc URLs.
- DO NOT use checkboxes, todo lists, or progress indicators.
- If you read prior bot/human comments, post a single summary comment classifying them: `RESOLVED:` / `STILL OUTSTANDING:` / `NEW:`. Post inline only for NEW.
- If no triggers matched, post: `AI Code Review: no issues found.`

Remember: Calypso is large and shared. Prioritize correctness, security, and cross-client blast radius over style. Flag intent, not taste.
