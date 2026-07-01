# Dashboard's Site Pages — Agent Instructions

## Single-notice invariant

**At most one *on-load* notice (banner) is visible at the top of any `/sites/*` page.** All on-load notices — banners whose eligibility is settled when the page mounts — MUST be rendered through `<SitesNoticeArbiter>` (`client/dashboard/sites/notice-arbiter.tsx`) inside the `notices` prop of `<PageLayout>`. Never render a banner as a content child of `<PageLayout>`.

**Action-feedback notices are a different category and MUST NOT be arbiter children.** A notice that appears in response to a user action mid-session (progress of a job the user just started, an error caused by their input) may appear, disappear, and reappear — that breaks the arbiter's on-mount latch (its disappearance would summon a shared engagement banner). Render these directly in the `notices` prop as a sibling of the arbiter, with the visibility condition at the call site. They may stack with the arbiter's banner; if the user causes several at once, showing several is fine. Place them above the arbiter.

### How it works

```tsx
<PageLayout
	notices={
		<>
			{ jobIsRunning && <JobProgressNotice /> /* action feedback: outside the arbiter */ }
			<SitesNoticeArbiter>
				{ isUrgent && <UrgentNotice /> }
				{ isRelevant && <RelevantNotice /> }
			</SitesNoticeArbiter>
		</>
	}
/>
```

- Pages pass their page-specific notices ("page candidates") as children of the arbiter, **ordered by priority** (most urgent first). Eligibility is decided at the call site, not inside the notice.
- The arbiter renders the **first non-null child**.
- The arbiter owns "shared candidates" we would want to appear on any sites page (e.g.: `SomeSurvey`). They compete on every page that renders the arbiter, but they always lose to page candidates.

### Rules for notice candidates

1. **No self-nulling.** A candidate component must not decide its own visibility by returning `null` from render. The arbiter only sees the child *elements* — a self-nulling component still wins the slot, renders nothing, and silently suppresses an eligible lower-priority notice. Hoist visibility conditions into a `useShouldShow*` hook (see `useShouldShowTimeMismatchNotice`) or a call-site condition.
2. **The one sanctioned self-null: in-session dismissal.** After the user clicks a notice's close button, the component may render `null` for the rest of the mount. The slot deliberately stays empty — dismissing one banner must not summon the next. *Persisted* dismissal preferences still belong in the eligibility hook so the slot is reassigned on the next page load.
3. **Eligibility must be settled before first paint.** Fetch eligibility data in the route loader (`queryClient.ensureQueryData(...)`) and read it with suspense queries, so a lower-priority notice never appears first and then gets displaced ("pop-in"). The dashboard already loads layout-shifting data in the router; notice eligibility is layout-shifting data.

### Adding a new notice

1. Decide the category first: is eligibility settled on page load (arbiter candidate), or does it appear in response to a user action mid-session (action feedback — render it as a sibling of the arbiter and stop here)?
2. Put the visibility condition in a hook or at the call site — not inside the component's render.
3. Add it as a child of `<SitesNoticeArbiter>` in the page's `notices` prop, positioned by priority relative to the page's other candidates.
4. Ensure the data the condition reads is prefetched in the page's route loader.
5. If the notice should appear on *many* pages, add it to the arbiter's shared candidates instead and place it in the shared priority order.

### Exceptions

- Error pages (e.g. `client/dashboard/sites/site/error.tsx`) render a single unconditional error notice directly via `notices=`; there is no competition to arbitrate and no healthy data context for the arbiter's shared candidates.
- Inline contextual notices (validation messages inside forms, cards, or modals) are not top-of-page notices and are out of scope.

### Reference implementations

- `client/dashboard/sites/overview/index.tsx` — `InaccessibleJetpackNotice` vs `StorageWarningBanner`
- `client/dashboard/sites/domains/index.tsx` — `PendingPrimaryDomainNotice` vs the redirect warning, with eligibility settled in the `siteDomainsRoute` loader; the bulk-update progress notice is action feedback rendered beside the arbiter
- `client/dashboard/sites/logs/index.tsx` — Jetpack-error UTC notice vs `TimeMismatchNotice`; the auto-refresh warning is action feedback rendered beside the arbiter
- `client/dashboard/sites/backups/index.tsx` — `BackupNotices` (backup progress/result) is action feedback rendered beside the arbiter
