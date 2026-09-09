# site-migration flow

Moves an existing site to WordPress.com. The flow has two branches: the long-standing
**WordPress** path (import or migrate, credentials, instructions) and a **non-WordPress**
wizard that keeps Wix/Squarespace/other sources inside Stepper instead of dropping them
into the content-only importer.

## The two branches

`site-migration-identify` scans the URL the user typed and reports a platform. What
happens next depends on it:

- **`platform === 'wordpress'`** — unchanged. The user goes to
  `site-migration-import-or-migrate` and on through the existing credentials / upgrade-plan /
  instructions path. Nothing in the non-WordPress work touches this branch.
- **`platform !== 'wordpress'`** — with the feature flag off, the flow hard-exits into
  `site-setup` (the dedicated importer when one exists for the platform, the importer list
  otherwise). With the flag on, it enters the wizard below.

The SSH branch still takes precedence over both when `migration/ssh-migration` is enabled,
the hosting provider is supported and the locale is English.

### The non-WordPress wizard

| #   | Step                                   | Slug                            |
| --- | -------------------------------------- | ------------------------------- |
| 1   | Your site — the address the user types | `site-migration-identify`       |
| 2   | Reading your site                      | `site-migration-capture`        |
| 3   | Review                                 | `site-migration-review`         |
| ·   | Plans (after Review, before checkout)  | `plans` (`STEPS.UNIFIED_PLANS`) |

The three numbered steps are the ones the progress header counts; the plans step sits
after Review and is not one of them. The canonical list lives in `wizard-steps.ts` so the
labels and the routing cannot drift apart.

The order is: **enter a URL → read the site → review → pick a plan → checkout → import**.

Reading the source site starts on step 2. `POST /wpcom/v2/static-site-import-session` takes
only a `source_url` and names no site, so the read can begin long before a destination site,
a plan or a payment exists. That is the whole point of the ordering: the ~45–60 seconds of
capture and build happen before the user picks a plan and pays, not after.

Step 2 waits for the read and then advances on its own at `preview_ready`. There is no
Continue button: Review can do nothing without an archive hash, so leaving early would only
move the same wait one screen forward. The copy follows the session state — collecting while
`capturing`, building while `building` — so the wait is legible. A failure is the only other
way off the step, and it always offers a way back to the address screen.

Two things carry that session forward, both on the URL:

- `importSessionId` — the session the capture step created. **Not** Stepper's own `sessionId`
  query parameter, which is its flow-state key and is on every step URL.
- `archiveHash` — the hash of the built archive the user saw on Review.

In-flow navigation merges the current query params (see `use-flow-navigation`), so both ride
along by themselves between steps. Checkout is the exception: it leaves Calypso entirely, so
`goToMigrationCheckout` writes both into the `redirect_to` URL. Anything not in that URL is
gone by the time the user comes back.

Approval is hash-bound. Review is where the user sees what the build found and hands the flow
the hash it was shown; `site-migration-import-progress` only approves when the hash it polls
matches the one that was reviewed. Landing on the import step directly therefore never imports
on the user's behalf.

Other notes:

- The flow always creates a new site. Site creation runs off the back of the plans step, so
  the chosen plan is already in the cart when checkout opens. Picking the free plan leaves the
  cart empty and the processing step skips checkout.
- The plans step hides the free plan (`getPlansIntent` returns `plans-ai-assembler-paid-only`
  for this flow). The import is delivered to an Atomic site and the free plan does not grant
  that; Personal and Premium do, so the grid is not narrowed to Business.
- `site-migration-scan` and `site-migration-preview` are still **parked**: they are built
  against an analysis and a rendered preview the API does not report. The old Choose, Domain
  and SEO screens were removed outright when the order changed.
- `wizardComplete=true` still tells the processing step that a site was created at the end of
  the wizard rather than before it.
- Both progress screens pass a class to `ProgressBar` and size it there. The component's own
  track carries a `:where( & ) { width: 160px }`, which no `.components-progress-bar` rule can
  reach, so a bar with no class of its own renders narrow and off to one side.

## Feature flag

`migration/non-wordpress-source` — `true` in `config/development.json`, `horizon`, `stage`,
`wpcalypso` and `test`; `false` in `config/production.json`. With it off, every non-WordPress
source behaves exactly as it did before the wizard existed.

## Testing instructions

1. `yarn start` and go to `http://calypso.localhost:3000/setup/site-migration`.
2. Enter a **WordPress** URL and confirm the existing path is unchanged:
   `site-migration-import-or-migrate` and onward.
3. Enter a **Wix or Squarespace** URL and walk the three screens through the plan picker,
   checkout, and on to the import progress step. Check that `importSessionId` is still on the
   URL after checkout sends you back.
4. Flip `migration/non-wordpress-source` off and confirm a non-WordPress URL exits to the
   `site-setup` importer list again.

### Running against the sandbox mock

The import session API is not deployed to production yet. Point
`public-api.wordpress.com` at a sandbox that has it (an `/etc/hosts` entry or the sandbox
browser extension) before walking the flow.

A sandbox mock also exists for the `/switch-runs` routes the parked scan and preview screens
used. The live flow no longer calls those routes, so the mock is only needed if you unpark
those screens.

## Known deviations and limitations

1. **Review shows a summary, not a rendered preview.** The session contract reports
   `preview_summary` but no preview URL, so Review lists what the build found rather than
   showing the rebuilt site.
2. **`preview_summary.blocks` cannot be shown.** It is the only count in the build report
   read from a separate diagnostics envelope, and a missing envelope degrades to `0` rather
   than to absent — so a perfectly good import reports `blocks: 0`, which reads as "we built
   nothing". Review shows `pages` (the API rejects a build whose report lacks it) and
   `diagnostics` (dropped wholesale when empty, so its absence is distinguishable). The other
   counts are reliable but say nothing `pages` has not already said.
3. **A free plan still reaches approval.** Nothing stops a user who skips the paid plans, and
   approval then fails with the Atomic error. The plans grid hides the free plan, which is as
   far as the front end can go without a backend change.
4. **Space Fast is gone.** The Choose screen that offered it was removed with this reordering.

## Owned by

@daledupreez (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
