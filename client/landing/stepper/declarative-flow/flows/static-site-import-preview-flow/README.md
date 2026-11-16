# static-site-import-preview flow

Moves a site built on another platform (Wix, Squarespace, and similar) onto a free preview site
on WordPress.com, and shows the move as it happens. Unlike `static-site-import`, there is no plan
or checkout before the move: the customer sees their site on WordPress.com first, and buys a plan
to keep it.

## Steps

| Step                         | Screen                                                  |
| ---------------------------- | ------------------------------------------------------- |
| `user`                       | Signup or login, skipped for a logged-in user           |
| `site-migration-identify`    | The source's address, analyzed as in `site-migration`   |
| `static-site-import-reading` | Starts the import session, then builds the preview site |

The identified source is kept in the flow’s state (`useFlowState`, under the identify step’s slug)
for this session, not in the URL. Opening the flow with `?from=<source>` skips identification and
reads that source directly.

The reading step is the one `static-site-import` uses when a customer leaves checkout
(`buildPreview`): it starts a static site import session, then builds a preview site through the
`preview` WoW funnel (`/sites/new` with `wow_funnel=preview` and the session’s
`import_session_id`). WordPress.com delivers the import onto the preview as soon as the build
lands, so the flow opens the preview’s Overview in the dashboard with `importSessionId`, `from` and
`platform`, where the move-progress card (`client/dashboard/sites/overview-static-site-import`)
tracks it.

The preview stays Coming Soon like every unpaid preview: WordPress.com keeps it hidden until a plan
is bought. When the move finishes while the customer is watching, Overview opens the preview at its
`?share=` link, which gets past Coming Soon and can be passed on.

## Failures

- Identification finds WordPress: the customer continues to `site-migration`'s check step.
- Identification finds a source the static import can’t take (parked, unhealthy, or skipped):
  the customer continues to `site-migration`'s identify step, which offers its usual paths.
- The session API finds WordPress behind the source: as above, `site-migration`'s check step.
- The session API refuses the source: the reading step says so and offers help.
- The server won’t build a preview: the customer goes to `static-site-import`'s plans step to
  buy a site for the move instead.
- Anything else: the error step.

## Feature flag

`migration/non-wordpress-source`, like `static-site-import`. With it off, the flow isn’t
registered.

## Testing instructions

1. Run `yarn start` and open `/setup/static-site-import-preview` while signed out. Sign up or log
   in with an account allowed to create preview sites.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes, **Checking your site** shows, and
   the browser opens the new preview’s Overview with **We’re moving your site**.
3. Open `/setup/static-site-import-preview?from=<a Squarespace URL>` while logged in. Confirm it
   skips the address step and lands on the preview’s Overview the same way.
4. Enter a WordPress site’s URL. Confirm the flow continues to `/setup/site-migration`.

## Owned by

@Automattic/dotcom-stepper
