# Sites Dashboard — Agent Instructions

## Single-notice invariant

**All banners and notices rendered on `/sites/*` routes MUST be surfaced through the `notices` prop of `<PageLayout>`.**

Direct rendering of banners as content children (i.e., as children of `<PageLayout>` rather than via its `notices` prop) is not allowed. This ensures that at most one notice is visible at a time on any given page, preventing visual noise from stacked alerts.

### How it works

Each page passes its notice(s) through `<PageLayout notices={...}>`. When multiple notices are conditionally eligible, the rendering logic must enforce a priority order so that only the highest-priority notice is shown. Lower-priority notices are suppressed while a higher-priority one is active.

Example priority ordering (highest to lowest):

1. Error/inaccessibility notices (e.g., `<InaccessibleJetpackNotice>`)
2. Actionable storage or operational warnings (e.g., `<StorageWarningBanner>`)
3. Informational/engagement prompts (e.g., `<OptInSurvey>`)

### Adding a new banner

1. Do **not** render the banner as a JSX child inside `<PageLayout>` content.
2. Pass it through the `notices` prop instead.
3. If another notice may already be shown on the same page, add a priority guard so only the more urgent notice renders.

### Reference implementation

- `client/dashboard/sites/overview/index.tsx` — priority ordering between `InaccessibleJetpackNotice`, `StorageWarningBanner`, and `OptInSurvey`
- `client/dashboard/sites/domains/index.tsx` — priority ordering between `BulkActionsProgressNotice`, `PendingPrimaryDomainNotice`, and the redirect warning
