# static-site-import-preview flow

Moves a site built on another platform (Wix, Squarespace, and similar) onto a free preview site
on WordPress.com, and shows the move as it happens. Unlike `static-site-import`, there is no plan
or checkout before the move: the customer sees their site on WordPress.com first, and buys a plan
to keep it.

## Steps

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
lands. The started session and preview are kept in the flow state under the reading step’s slug.

The progress step tracks the move with the dashboard’s own progress card and hook
(`StaticSiteImportProgress` and `useStaticSiteImport` in
`client/dashboard/sites/overview-static-site-import`), so the customer sees the same screen in
signup as on the preview’s Overview.

The preview stays Coming Soon like every unpaid preview: WordPress.com keeps it hidden until a plan
is bought. When the move finishes, the flow opens the preview at its `?share=` link, which gets
past Coming Soon and can be passed on. Without a share link, it opens the preview’s Overview.

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

1. Run `yarn start` and open `/setup/static-site-import-preview` while signed out. Sign up or log
   in with an account allowed to create preview sites.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes, **Checking your site** shows, and
   the flow stays in signup on **We’re moving your site**, the same card the preview’s Overview
   shows.
3. Wait for the move to finish. Confirm the browser opens the preview at its `?share=` link.
4. Open `/setup/static-site-import-preview?from=<a Squarespace URL>` while logged in. Confirm it
   skips the address step and shows the move’s progress the same way.
5. Enter a WordPress site’s URL. Confirm the flow continues to `/setup/site-migration`.

## Owned by

@Automattic/dotcom-stepper
