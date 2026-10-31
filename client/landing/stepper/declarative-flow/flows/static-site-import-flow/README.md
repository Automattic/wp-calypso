# static-site-import flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com.

The `site-migration` flow identifies the source without requiring an account and hands eligible
non-WordPress sources here with `from` and `platform`. For now, other sources with a content
importer (Medium, Substack, and others) keep using it; see `canUseStaticSiteImport`.
Opening this flow without a supported source sends the user to that identify step.

## Steps

| Step                         | Screen                                      |
| ---------------------------- | ------------------------------------------- |
| `plans`                      | Public plan selection for a new destination |
| Unified checkout             | Account, payment, and destination creation  |
| `static-site-import-reading` | Checking your site as the session starts    |

There is no preview or address/domain selection step. Unified checkout creates the destination
site and returns its ID to the authenticated reading step. That step starts the import session
and immediately opens the site’s Overview in the dashboard
(`client/dashboard/sites/overview-static-site-import`). Overview records delivery intent and
tracks capture and import in the background, then asks whether the finished site looks right.

An existing destination requires authentication. Paid destinations skip plans and checkout;
free destinations use site checkout to buy a plan before starting the import session.
The reading step asks for confirmation before importing into an existing destination unless
this tab just came back from checkout in this flow. When unified checkout created the site
(`newSite=1`), the step also records the signup and applies the flow’s site settings.

If the session API refuses the source, the reading step says so and stops there. Other failures
to start fall back to the content importer for the destination site.

The source, platform, and entry parameters survive checkout in the return URL. The receipt
resolves the new destination’s `siteId`. Cancelling checkout returns to plans with the source
and any existing destination retained. Once the session starts, Overview receives its
`importSessionId` so it can resume tracking after a reload.

## Preview sites

With `migration/static-site-preview` on, a new destination is a preview site instead of a paid one:
the login step replaces plans and checkout. The reading step starts the import session, then builds
the preview through the `preview` WoW funnel (`/sites/new` with `wow_funnel=preview` and the
session's `import_session_id`). WordPress.com delivers the import onto the preview as soon as the
build lands, so the flow goes straight to the preview's Overview.

Overview tracks the import as usual. When it finishes while the customer is watching, Overview opens
the preview at its share URL, which gets past Coming Soon. Coming back later shows **Your preview is
ready** with **View site** and **Choose a plan**: buying a plan keeps the site, and an unpaid preview
is removed when its review window ends.

Existing destinations behave as described above whether the flag is on or off.

## Feature flags

- `migration/non-wordpress-source`. With it off, the flow isn’t registered and `site-migration`
  keeps its previous behavior.
- `migration/static-site-preview`. Builds a preview site for a new destination instead of asking
  for a plan. WordPress.com also has to allow the account to create preview sites.

## Testing instructions

1. Run `yarn start` and open `/setup/site-migration` while signed out.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes and opens
   `/setup/static-site-import/plans` without signup or login.
3. Pick a plan. Confirm unified checkout includes account creation, and no import-session request
   has run. Cancel checkout and confirm the source is retained on plans.
4. In a test account, complete checkout. Confirm the reading step starts a session, then opens
   the destination’s Overview with **We’re moving your site**. Reload and confirm it resumes.
5. Once it’s ready, try the thumbs up and thumbs down buttons; thumbs down opens the Help Center.
6. Repeat with an existing destination: a free site requires checkout and a paid site skips it.
   Confirm that a direct reading link shows the destination and requires clicking **Import into
   this site**, even with `newSite=1` or an existing `importSessionId` in the URL.

### Preview sites

1. With `migration/static-site-preview` on and an account allowed to create preview sites, open
   `/setup/site-migration` and enter a site without an importer.
2. Confirm the flow asks you to log in or sign up, with no plans step or checkout.
3. Confirm reading starts a session, builds a preview site, and opens its Overview with **We’re
   moving your site**.
4. When the import finishes, confirm the browser opens the preview at its `?share=` URL.
5. Open the preview's Overview again and confirm **Your preview is ready**, with **View site** and
   **Choose a plan**.

## Owned by

@Automattic/dotcom-stepper
