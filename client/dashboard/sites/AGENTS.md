# Sites Dashboard — Agent Instructions

## Single-notice invariant

**At most one notice (banner) is visible at the top of any `/sites/*` page.** All top-of-page notices MUST be rendered through `<SitesNoticeArbiter>` (`client/dashboard/sites/notice-arbiter.tsx`) inside the `notices` prop of `<PageLayout>`. Never render a banner as a content child of `<PageLayout>`.

### How it works

```tsx
<PageLayout
	notices={
		<SitesNoticeArbiter>
			{ isUrgent && <UrgentNotice /> }
			{ isRelevant && <RelevantNotice /> }
		</SitesNoticeArbiter>
	}
>
```

- Pages pass their page-specific notices ("page candidates") as children of the arbiter, **ordered by priority** (most urgent first). Eligibility is decided at the call site, not inside the notice.
- The arbiter renders the **first non-null child**.
- The arbiter owns the "shared candidates" (engagement prompts: `OptInWelcome`, `OptInSurvey`). They compete on every page that renders the arbiter, and they always lose to page candidates.

### Rules for notice candidates

1. **No self-nulling.** A candidate component must not decide its own visibility by returning `null` from render. The arbiter only sees the child *elements* — a self-nulling component still wins the slot, renders nothing, and silently suppresses an eligible lower-priority notice. Hoist visibility conditions into a `useShouldShow*` hook (see `useShouldShowOptInWelcome`, `useShouldShowTimeMismatchNotice`) or a call-site condition.
2. **The one sanctioned self-null: in-session dismissal.** After the user clicks a notice's close button, the component may render `null` for the rest of the mount. The slot deliberately stays empty — dismissing one banner must not summon the next. *Persisted* dismissal preferences still belong in the eligibility hook so the slot is reassigned on the next page load.
3. **Eligibility must be settled before first paint.** Fetch eligibility data in the route loader (`queryClient.ensureQueryData(...)`) and read it with suspense queries, so a lower-priority notice never appears first and then gets displaced ("pop-in"). The dashboard already loads layout-shifting data in the router; notice eligibility is layout-shifting data.

### Adding a new notice

1. Put the visibility condition in a hook or at the call site — not inside the component's render.
2. Add it as a child of `<SitesNoticeArbiter>` in the page's `notices` prop, positioned by priority relative to the page's other candidates.
3. Ensure the data the condition reads is prefetched in the page's route loader.
4. If the notice should appear on *many* pages, add it to the arbiter's shared candidates instead and place it in the shared priority order.

### Exceptions

- Error pages (e.g. `client/dashboard/sites/site/error.tsx`) render a single unconditional error notice directly via `notices=`; there is no competition to arbitrate and no healthy data context for the arbiter's shared candidates.
- Inline contextual notices (validation messages inside forms, cards, or modals) are not top-of-page notices and are out of scope.

### Reference implementations

- `client/dashboard/sites/overview/index.tsx` — `InaccessibleJetpackNotice` vs `StorageWarningBanner`
- `client/dashboard/sites/domains/index.tsx` — bulk update progress vs `PendingPrimaryDomainNotice` vs the redirect warning, with eligibility settled in the `siteDomainsRoute` loader
- `client/dashboard/sites/logs/index.tsx` — operational warning vs `TimeMismatchNotice`
