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
| 2   | Scan — "Reading your site"                         | `site-migration-scan`           |
| 3   | Choose — "Where would you like your site to live?" | `site-migration-destination`    |
| 4   | Preview — "Here’s your site on WordPress.com"      | `site-migration-preview`        |
| 5   | Domain — "Keep your address, or pick a new one"    | `site-migration-domain`         |
| ·   | Plans (inserted after Domain)                      | `plans` (`STEPS.UNIFIED_PLANS`) |
| 6   | SEO — "Your Google ranking comes with you"         | `site-migration-seo`            |
| 7   | Review                                             | `site-migration-review`         |

The numbered steps are the seven the progress header counts; the plans step sits between
Domain and SEO but is not one of them. The canonical list lives in `wizard-steps.ts` so the
labels and the routing cannot drift apart.

Detours and exits:

- Domain `register` goes through `STEPS.DOMAIN_SEARCH`, `keep` through `STEPS.USE_MY_DOMAIN`;
  both rejoin at Plans. `free-subdomain` continues straight through.
- A destination site already on a paid plan skips Plans (Domain goes straight to SEO) and
  skips checkout at Review.
- Review → **Migrate** creates the site if there isn't one, then goes to checkout with a
  `redirect_to` of `site-migration-import-progress`, which attaches the switch run to the
  new site, approves the import and polls it to completion.
- A failed scan falls back to today's content importer.

## Feature flag

`migration/non-wordpress-source` — `true` in `config/development.json`, `horizon`, `stage`,
`wpcalypso` and `test`; `false` in `config/production.json`. With it off, every non-WordPress
source behaves exactly as it did before the wizard existed.

## Testing instructions

1. `yarn start` and go to `http://calypso.localhost:3000/setup/site-migration`.
2. Enter a **WordPress** URL and confirm the existing path is unchanged:
   `site-migration-import-or-migrate` and onward.
3. Enter a **Wix or Squarespace** URL and walk the seven screens through to checkout and the
   import progress step.
4. Flip `migration/non-wordpress-source` off and confirm a non-WordPress URL exits to the
   `site-setup` importer list again.

### Running against the sandbox mock

The backend the wizard talks to (`/wpcom/v2/switch-runs` and
`/wpcom/v2/sites/{id}/static-site-import-session`) is not deployed. A mock lives on the
sandbox at `wp-content/rest-api-plugins/endpoints/static-site-switch-mock.php`. It registers
its routes only when `WPCOM_SANDBOXED` is set, the real endpoints are off, and the
`wpcom_static_site_switch_mock_enabled` filter returns true — so it can never collide with
the real endpoints or leak off a sandbox.

To exercise it, point `public-api.wordpress.com` at your sandbox (an `/etc/hosts` entry or
the sandbox browser extension) before walking the flow.

The mock is **completely stateless** — it writes no user meta, no options, nothing. Every
response is a pure function of the request and the clock, with the creation timestamp and
the source host encoded into the `run_id` / `session_id` themselves. Polling therefore still
shows real progress (`analysis_queued → analyzing → analysis_ready` over about eight
seconds), and the file can be deleted at any time without leaving a trace behind.

Two consequences of having no server-side state:

- **The import session auto-advances past `preview_ready`** (`preview_ready` → `queued` →
  `applying` → `finished`, from roughly 9s to 28s). A stateless GET cannot observe that
  `/approve` was called, so the apply phase starts on its own even if you never press
  **Start the import**. Use `?mock_state=preview_ready` to hold that screen while working
  on it. The client-side approval guard is unaffected and is covered by unit tests.
- **`POST /switch-runs` is not idempotent** and `/attach` does not detect re-attaching to a
  different site. Neither matters in practice: the scan step persists `runId` in the URL and
  flow state, so a refresh resumes rather than re-creating.

QA hatches, all mock-only:

| Hatch                              | Effect                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `?mock_state=<state>` on any GET   | Pins the returned state (`preview_ready`, `failed`, …)                      |
| `?mock_speed=instant`              | Collapses every timing threshold to zero                                    |
| A source host containing `fail`    | `state: 'failed'`, `error: 'capture_failed'`                                |
| A source host containing `partial` | A `findings` array with two `ok: false` rows and `verdict.level: 'partial'` |

## Known deviations and limitations

1. **Post-checkout apply needs an explicit "Start the import" click.** The spec asks for the
   import to auto-approve after checkout. `plan_hash` only exists on the site-scoped session,
   which only exists after the switch run is attached to the destination site — and that
   attach happens inside `site-migration-import-progress`, after checkout. So no reviewed
   hash can be carried in from before checkout, and the step falls back to asking the user to
   confirm. The auto-approve path is implemented and fires the moment a hash _is_ carried in
   (a refresh, or a resumed session). Closing this needs the API to expose a hash before the
   destination site exists — take it back to wpcom PR 232851 alongside the `analysis` object
   and the `/preview` route that PR is also missing.
2. **Space Fast is out of scope.** The Choose screen renders the card, but selecting it
   dead-ends at a placeholder error step. Only the WordPress.com destination is built.
3. **The Review screen's copy is a placeholder** pending its mockup. The routing does not
   depend on it.
4. **The plans step shows the standard plans chrome**, not the seven-segment wizard progress
   bar. `STEPS.UNIFIED_PLANS` is shared, and giving it the bar would mean adding a
   `topBarCenterElement` prop to its `accepts` type.

## Owned by

@daledupreez (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
