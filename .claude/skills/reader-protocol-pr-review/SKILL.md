---
name: reader-protocol-pr-review
description: Use when reviewing PRs that touch the Reader's multi-protocol social surfaces (`client/reader/social/`, `client/reader/atmosphere/`, `client/reader/mastodon/`, `packages/api-core/src/reader-{atmosphere,mastodon}/`, `packages/api-queries/src/reader-{atmosphere,mastodon}.ts`). Captures the review rubric + the recurring smells from the CM-625 / CM-658 / CM-660 / CM-662 slice cycle.
---

# Reader Protocol PR Review

Use this when reviewing a PR in the Reader's social/atmosphere/mastodon territory — slice work for the protocol-adapter pattern, optimistic mutations, or the shared post-card components. The recurring findings are concrete enough to be a checklist; the rubric below comes from the CM-658/CM-660 cycle where the same issues appeared in both PRs.

## Rubric

For each finding write:

```
| Severity | File:line | Issue (1-2 sentences) | Suggested fix |
```

- **Severity tags**: `blocker` (PR can't merge), `important` (real bug, would cause user-visible issues), `nit` (cleanup or hardening).
- **File:line**: anchor with absolute path or repo-relative path so the comment can be left inline on GitHub. Use `gh api repos/Automattic/wp-calypso/pulls/{n}/comments` to post inline replies (not top-level PR comments) when the line is in the diff.
- **In-PR vs follow-up**: explicitly call this out. Architectural changes that span multiple slices belong in a follow-up issue. Defensive hardening, missing default arms, etc. are cheap to fold in.
- **Verdict line**: `Approve` / `Request changes` / `Needs more discussion`. If approve, list any follow-ups worth filing as separate tickets.

Cap reviews at ~700 words. The reviewer's signal-to-noise ratio matters — detailed prose drowns out the actual blockers.

## When to dispatch the `code-reviewer` agent

The `superpowers:code-reviewer` agent is independent and reads the diff fresh. Dispatch it when:

- The PR is large (>20 files or >500 lines).
- The PR shape is structurally similar to a sibling PR you've already reviewed (it'll surface the same recurring smells consistently).
- You authored adjacent code and want an independent eye.

Brief the agent with: PR number, branch path, what the PR does, and a list of recurring smells from `references/common-smells.md` to specifically check. The agent's response is the body of your review.

## Reply convention on PR threads

- **No "thanks for the review"** — `superpowers:receiving-code-review` rules apply. State the fix or push back; actions speak.
- **Reply on inline comment threads** for inline review comments (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not as top-level PR comments. The threading matters for context.
- **Top-level comment for review-summary acknowledgement**, listing which findings landed in commit X and which are deferred follow-ups (with rationale).
- **No fabricated wp.me shortlinks** — never invent a shortlink for a `*.wordpress.com` URL. See `a8c-url-shorthand:a8c-url-shorthand`.

## Common smells

See `references/common-smells.md` — checklist of 9+ recurring findings from the recent slice cycle. Walk it before submitting your review.

## Cross-pollinating fixes between sibling PRs

When two slice PRs are open simultaneously (CM-658 + CM-660 was the canonical case), review feedback on one almost always applies to the other. The architectural patterns mirror each other.

After landing a fix on PR A, check whether PR B has the same issue:

```bash
git -C /Users/pfefferle/Code/wp-calypso show <fix-commit-on-A> -- <relevant-paths>
git -C /Users/pfefferle/Code/wp-calypso show <branch-of-B>:<relevant-path> | grep <smell>
```

If yes, apply the fix to B too. Don't wait for the reviewer to file the same finding twice.

## File-shape expectations

These are the Reader-protocol files that consistently need attention. Reviewers should check each:

| File pattern | What to verify |
|---|---|
| `client/reader/social/components/post-card/{like,repost}-context.tsx` | `LikeAction`/`RepostAction` interface has no dead fields; null-action default mirrors the live shape. |
| `client/reader/social/components/post-card/{like,repost}-button.tsx` | Renders a static-count fallback when `!action.supported` — **not** `null`. The fallback lives inside the button, not in `<PostCardCounts>`. |
| `client/reader/social/components/post-card/post-card-counts.tsx` | Always renders `<LikeButton>` / `<RepostButton>` (no `connectionId` ternary for the like/repost slot — the button handles supported / unsupported internally). |
| `client/reader/{atmosphere,mastodon}/use-{protocol}-{like,repost}-action.ts` | `errorMessageFor*` switch has a `default:` arm; `trackError` includes a `logToLogstash` call; cid/rkey guards before calling `mutate`. |
| `packages/api-queries/src/reader-{atmosphere,mastodon}.ts` | Optimistic patcher is connection-scoped; `cancelQueries` is wrapped in `try`/`catch` in `onMutate`; mutation factories take `connectionId: number`, not `QueryClient`. |
| `packages/api-core/src/reader-{atmosphere,mastodon}/fetchers.ts` | Path-interpolated wire IDs are `encodeURIComponent`-wrapped. |

## Reference

- `references/common-smells.md` — the smell catalog, with concrete examples from the slice cycle.
- `client/reader/social/AGENTS.md` — describes the provider-adapter pattern + naming convention.
- `client/reader/AGENTS.md` § "Optimistic-mutation hardening checklist" — engineering-side pre-flight for the patterns this skill reviews.
