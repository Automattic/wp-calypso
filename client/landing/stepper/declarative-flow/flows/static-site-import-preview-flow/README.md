# static-site-import-preview flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com, testing
two orders of the same steps: identify the source, see it on its way, pick a plan, check out.

## Experiment

Opening the flow assigns the `calypso_static_site_import_preview_checkout_first_202611` ExPlat
experiment, before login so signed-out visitors are assigned too.

- Any other variation, including control (A): copies the site onto a free preview and shows the
  move, then a plan and checkout for that preview. See [Preview first](#preview-first).
- `import_after_checkout` (B): shows what will be moved, then a plan and checkout before any
  import. See [Checkout first](#checkout-first).

Outside production, `?variation=a` or `?variation=b` on any of the flow's URLs assigns the browser
to that variation for a day, by storing the assignment where ExPlat keeps it.

Both variations register the same steps, in one list. Each starts at its own first step and
only goes to its own, and the checkout-first variation asks for login only after checkout.

The identified source is kept in the flow’s state (`useFlowState`, under the identify step’s slug)
for this session, not in the URL. Opening the flow with `?from=<source>` (and optionally
`&platform=`) skips identification and stores that source in the flow state the same way.

Both variations offer the same plans grid: the default one, without Free, since the move needs a
paid plan, with **Skip**.

### Checkout first

| Step                      | Screen                                            |
| ------------------------- | ------------------------------------------------- |
| `site-migration-identify` | The source's address, before login                |
| `confidence-step`         | The source, where it’s going, and what we’ll copy |
| `plans`                   | Public plan selection, with Skip                  |
| Unified checkout          | Account, payment, and site creation               |
| Progress screen           | The new site’s Overview, which shows the move     |

The confidence step is `site-migration`’s check screen (`SiteMigrationConfirm`) for a new site: a
window onto the source, the route to a new WordPress.com site, and what we’ll copy over.

Picking a plan starts an import session for the source, then sends the customer to checkout.
Checkout returns to the new site’s Overview with the session (`/sites/:siteId?importSessionId=`),
which names the site as the destination and shows the move, so the flow has nothing to do after
checkout.

Skipping plans asks for signup or login, then the generic processing step starts the import
session and builds a free preview through the `preview` WoW funnel, as A’s progress step does. The
flow then opens the preview’s Overview, which shows the move.

Leaving checkout comes back to plans with `checkoutExit=1`, and skipping plans adds
`skippedPlans=1`. Signing up can change the visitor’s assignment, so those parameters keep the run
in B.

### Preview first

| Step                          | Screen                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| `user`                        | Signup or login, skipped for a logged-in user                |
| `site-migration-identify`     | The source's address, analyzed as in `site-migration`        |
| `static-site-import-progress` | Starts the move onto a preview site, and shows it to the end |
| `plans`                       | Plan selection for the preview, with Skip to its homepage    |
| Checkout                      | Payment for the preview, then its Overview                   |

The progress step starts a static site import session, then builds a preview site through the
`preview` WoW funnel (`/sites/new` with `wow_funnel=preview` and the session’s
`import_session_id`). WordPress.com delivers the import onto the preview as soon as the build
lands. The started session and preview are kept in the flow state under the step’s slug, with the
source they copy. Going back to the step for the same source picks up that move (`startedImport`)
instead of starting another.

The step tracks the move with the dashboard’s own progress steps, site window and hook
(`StaticSiteImportPreviewSteps`, `StaticSiteImportPreviewWindow` and `useStaticSiteImport` in
`client/dashboard/sites/static-site-import`), laid out for signup. When the move finishes, the
flow offers plans, and checkout buys the plan for the preview, which then opens its Overview.

## Failures

- Identification finds WordPress: the customer continues to `site-migration`'s check step.
- Identification finds a source the static import can’t take (parked, unhealthy, or skipped):
  the customer continues to `site-migration`'s identify step, which offers its usual paths.
- The session API finds WordPress behind the source: as above, `site-migration`'s check step.
- The session API refuses the source: the progress step says so and offers help.
- The server won’t build a preview: the customer goes to `static-site-import`'s plans step to
  buy a site for the move instead.
- The move fails, stalls, is refused or can’t be read: the flow opens the preview’s Overview,
  which explains what happened and offers what can be done about it.
- Anything else: the error step.

## Feature flag

`migration/non-wordpress-source`, like `static-site-import`. With it off, the flow isn’t
registered.

## Testing instructions

For the preview-first variation (A), add `?variation=a` to the first URL:

1. Run `yarn start` and open `/setup/static-site-import-preview` while signed out. Sign up or log
   in with an account allowed to create preview sites.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes, and the flow stays in signup on
   **Copying your site**.
3. Go back in the browser. Confirm the flow returns to **Copying your site** for the same move,
   and no other preview site is created.
4. Wait for the move to finish. Confirm the flow opens `/setup/static-site-import-preview/plans`,
   without Free.
5. Pick a plan. Confirm checkout is for the preview site, and completing it opens the preview’s
   Overview.
6. Repeat, selecting **Skip** on plans. Confirm it opens the preview’s homepage through its share
   link, past Coming Soon.
7. Open `/setup/static-site-import-preview?from=<a Squarespace URL>` while logged in. Confirm it
   skips the address step and shows the move’s progress the same way.
8. Enter a WordPress site’s URL. Confirm the flow continues to `/setup/site-migration`.

For the checkout-first variation (B), add `?variation=b` to the first URL:

1. Open `/setup/static-site-import-preview?variation=b` while signed out. Confirm it asks for the source
   without signup, and stays in this flow.
2. Enter a Wix or Squarespace URL. Confirm **We can copy your whole site** shows the source going
   to a new WordPress.com site, and no import-session request has run.
3. Select **Continue**. Confirm it opens `/setup/static-site-import-preview/plans`, without Free.
4. Pick a plan. Confirm an import session is created, and unified checkout includes account
   creation.
5. Complete checkout in a test account. Confirm it opens the new site’s Overview with **We’re
   moving your site**.
6. Repeat, leaving checkout instead. Confirm it returns to plans.
7. Repeat, selecting **Skip** on plans. Confirm it asks for signup, then opens the preview’s
   Overview with the move under way.

## Owned by

@Automattic/dotcom-stepper
