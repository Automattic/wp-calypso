# static-site-import-preview flow

Moves a site built on another platform (Wix, Squarespace, and similar) onto a free preview site
on WordPress.com, and shows the move as it happens. Unlike `static-site-import`, there is no plan
or checkout before the move: the customer sees their site on WordPress.com first, and buys a plan
to keep it.

## Experiment

Opening the flow assigns the `calypso_static_site_import_preview_checkout_first_202611` ExPlat
experiment, before login so signed-out visitors are assigned too.

- `import_after_checkout` (A): the flow runs `static-site-import`’s steps up to checkout, without
  leaving this flow. See [Checkout first](#checkout-first).
- Any other variation, including control (B): the preview-first flow in [Steps](#steps), which
  moves the site onto a preview before any checkout.

Checkout returns to the reading step with `siteId` (or `checkoutExit=1` when the customer left
it). Signing up at checkout can change the visitor’s assignment, so those parameters keep the run
in A from then on.

### Checkout first

| Step                         | Screen                                                       |
| ---------------------------- | ------------------------------------------------------------ |
| `site-migration-identify`    | The source's address, before login                           |
| `plans`                      | Public plan selection, the same as `static-site-import`’s    |
| Unified checkout             | Account, payment, and site creation                          |
| `static-site-import-reading` | Starts the import into the new site, then opens its Overview |

The steps, props and checkout are `static-site-import`’s for a new destination: plans recommend
Personal (`getNewDestinationPlansProps`), and the flow’s plan styles apply here too. Leaving
checkout builds a preview of the import instead, as in `static-site-import`. A source on the URL
skips identification, and opening the reading step before checkout goes to plans.

## Steps

The preview-first variation (B):

| Step                          | Screen                                                  |
| ----------------------------- | ------------------------------------------------------- |
| `user`                        | Signup or login, skipped for a logged-in user           |
| `site-migration-identify`     | The source's address, analyzed as in `site-migration`   |
| `static-site-import-reading`  | Starts the import session, then builds the preview site |
| `static-site-import-progress` | Shows the move's progress until it ends                 |

The identified source is kept in the flow’s state (`useFlowState`, under the identify step’s slug)
for this session, not in the URL. Opening the flow with `?from=<source>` (and optionally
`&platform=`) skips identification and stores that source in the flow state the same way.

The reading step is the one `static-site-import` uses when a customer leaves checkout
(`buildPreview`): it starts a static site import session, then builds a preview site through the
`preview` WoW funnel (`/sites/new` with `wow_funnel=preview` and the session’s
`import_session_id`). WordPress.com delivers the import onto the preview as soon as the build
lands. The started session and preview are kept in the flow state under the reading step’s slug,
with the source they copy. Going back to the reading step for the same source picks up that move
(`startedImport`) instead of starting another, so the progress step shows its status as before.

The progress step tracks the move with the dashboard’s own progress steps, site window and hook
(`StaticSiteImportPreviewSteps`, `StaticSiteImportPreviewWindow` and `useStaticSiteImport` in
`client/dashboard/sites/static-site-import`), laid out for signup.

The preview stays Coming Soon like every unpaid preview: WordPress.com keeps it hidden until a plan
is bought. When the move finishes, the flow opens the preview at its `?share=` link, which gets
past Coming Soon. The progress step waits until WordPress.com reports the link it made for the
preview, and only goes on once it has it.

## Failures

- Identification finds WordPress: the customer continues to `site-migration`'s check step.
- Identification finds a source the static import can’t take (parked, unhealthy, or skipped):
  the customer continues to `site-migration`'s identify step, which offers its usual paths.
- The session API finds WordPress behind the source: as above, `site-migration`'s check step.
- The session API refuses the source: the reading step says so and offers help.
- The server won’t build a preview: the customer goes to `static-site-import`'s plans step to
  buy a site for the move instead.
- The move fails, stalls, is refused or can’t be read: the flow opens the preview’s Overview,
  which explains what happened and offers what can be done about it.
- Anything else: the error step.

## Feature flag

`migration/non-wordpress-source`, like `static-site-import`. With it off, the flow isn’t
registered.

## Testing instructions

For the preview-first variation (B), force any variation but `import_after_checkout`:

1. Run `yarn start` and open `/setup/static-site-import-preview` while signed out. Sign up or log
   in with an account allowed to create preview sites.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes, **Checking your site** shows, and
   the flow stays in signup on **Copying your site**.
3. Go back in the browser. Confirm the flow returns to **Copying your site** for the same move,
   and no other preview site is created.
4. Wait for the move to finish. Confirm the browser opens the preview at its `?share=` link.
5. Open `/setup/static-site-import-preview?from=<a Squarespace URL>` while logged in. Confirm it
   skips the address step and shows the move’s progress the same way.
6. Enter a WordPress site’s URL. Confirm the flow continues to `/setup/site-migration`.

For the checkout-first variation (A), force `import_after_checkout`:

1. Open `/setup/static-site-import-preview` while signed out. Confirm it asks for the source
   without signup, and stays in this flow.
2. Enter a Wix or Squarespace URL. Confirm it opens `/setup/static-site-import-preview/plans`,
   which looks like `/setup/static-site-import/plans`, with Personal recommended.
3. Pick a plan. Confirm unified checkout includes account creation, and no import-session request
   has run.
4. Complete checkout in a test account. Confirm the reading step starts the move without asking to
   confirm, then opens the new site’s Overview with **We’re moving your site**.
5. Repeat, leaving checkout instead. Confirm the reading step builds a preview and opens its
   Overview.

## Owned by

@Automattic/dotcom-stepper
