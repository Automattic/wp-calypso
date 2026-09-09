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

| #   | Step                                               | Slug                            |
| --- | -------------------------------------------------- | ------------------------------- |
| 1   | Your site                                          | `site-migration-identify`       |
| 2   | Choose — "Where would you like your site to live?" | `site-migration-destination`    |
| 3   | Domain — "Keep your address, or pick a new one"    | `site-migration-domain`         |
| ·   | Plans (inserted after Domain)                      | `plans` (`STEPS.UNIFIED_PLANS`) |
| 4   | SEO — "Your Google ranking comes with you"         | `site-migration-seo`            |
| 5   | Review                                             | `site-migration-review`         |

The numbered steps are the five the progress header counts; the plans step sits between
Domain and SEO but is not one of them. The canonical list lives in `wizard-steps.ts` so the
labels and the routing cannot drift apart.

Two more screens are written but **parked**: `site-migration-scan` ("Reading your site") and
`site-migration-preview` ("Here's your site on WordPress.com"). Both are built against data
the API does not report yet — a structured `analysis` of the source site, a rendered
`preview_url`, and a match score. Their components, styles and tests are still in the
repository and unchanged; they are simply not listed in `BASE_STEPS`, so nothing routes to
them and TypeScript will reject any attempt to. Put them back by restoring their entries in
`BASE_STEPS` and in `wizard-steps.ts`, and re-pointing the two navigation edges noted below.

Detours and exits:

- Identify sends a non-WordPress source straight to Choose. It went via Scan before Scan was
  parked, and Choose went via Preview before Preview was parked.
- Domain `register` goes through `STEPS.DOMAIN_SEARCH`, `keep` through `STEPS.USE_MY_DOMAIN`;
  both rejoin at Plans. `free-subdomain` continues straight through.
- A destination site already on a paid plan skips Plans (Domain goes straight to SEO) and
  skips checkout at Review.
- Review → **Migrate** creates the site if there isn't one, then goes to checkout with a
  `redirect_to` of `site-migration-import-progress`, which creates the import session, polls
  it, and — once the user confirms — approves it against the destination site.
- `wizardComplete=true` is what tells the processing step that a site was created at the end
  of the wizard rather than before it, so it lands on the import step instead of restarting
  the wizard.

## Feature flag

`migration/non-wordpress-source` — `true` in `config/development.json`, `horizon`, `stage`,
`wpcalypso` and `test`; `false` in `config/production.json`. With it off, every non-WordPress
source behaves exactly as it did before the wizard existed.

## Testing instructions

1. `yarn start` and go to `http://calypso.localhost:3000/setup/site-migration`.
2. Enter a **WordPress** URL and confirm the existing path is unchanged:
   `site-migration-import-or-migrate` and onward.
3. Enter a **Wix or Squarespace** URL and walk the five screens through to checkout and the
   import progress step.
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

1. **Nothing reads the source site until after checkout.** The session — which is what
   starts the read — is created on `site-migration-import-progress`, because the screen that
   used to start it earlier is parked. So the user picks a domain and a plan before we have
   looked at their site, and the whole wait happens after they have paid. The session is not
   tied to a site, so creating it earlier is a routing change and nothing more; that is worth
   doing when the scan screen comes back.
2. **The import needs an explicit "Start the import" click.** Approval is bound to the
   archive hash the user was shown, and that hash only exists once the build is ready — which
   is after checkout, per the point above. The auto-approve path is implemented and fires the
   moment a reviewed hash _is_ carried in (a refresh, or a resumed session).
3. **Review has little to show.** The "What comes across" row falls back to "We'll confirm
   this once your site has been read" because the counts came from the parked scan.
4. **Space Fast is out of scope.** The Choose screen renders the card, but selecting it
   dead-ends at a placeholder error step. Only the WordPress.com destination is built.
5. **The Review screen's copy is a placeholder** pending its mockup. The routing does not
   depend on it.
6. **The plans step shows the standard plans chrome**, not the wizard progress bar.
   `STEPS.UNIFIED_PLANS` is shared, and giving it the bar would mean adding a
   `topBarCenterElement` prop to its `accepts` type.

## Owned by

@daledupreez (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
