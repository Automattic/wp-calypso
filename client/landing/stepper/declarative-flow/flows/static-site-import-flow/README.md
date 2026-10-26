# static-site-import flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com.

The `site-migration` flow identifies the source without requiring an account and hands eligible
non-WordPress sources here with `from` and `platform`. Opening this flow without a supported source
sends the user to that identify step.

## Steps

| Step                         | Screen                                      |
| ---------------------------- | ------------------------------------------- |
| `plans`                      | Public plan selection for a new destination |
| Unified checkout             | Account, payment, and destination creation  |
| `static-site-import-reading` | Checking your site as the session starts    |

There is no preview or address/domain selection step. Unified checkout creates the destination
site and returns its ID to the authenticated reading step. That step starts the import session
and immediately opens the site's Overview in the dashboard
(`client/dashboard/sites/overview-static-site-import`). Overview records delivery intent and
tracks capture and import in the background, then asks whether the finished site looks right.

An existing destination requires authentication. Paid destinations skip plans and checkout;
free destinations use site checkout to buy a plan before starting the import session.

If the session API refuses the source, the reading step says so and stops there. Other failures
to start fall back to the content importer for the destination site.

The source, platform, and entry parameters survive checkout in the return URL. The receipt
resolves the new destination's `siteId`. Cancelling checkout returns to plans with the source
and any existing destination retained. Once the session starts, Overview receives its
`importSessionId` so it can resume tracking after a reload.

## Feature flag

`migration/non-wordpress-source`. With it off, the flow isn't registered and `site-migration` keeps
its previous behavior.

## Testing instructions

1. Run `yarn start` and open `/setup/site-migration` while signed out.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes and opens
   `/setup/static-site-import/plans` without signup or login.
3. Pick a plan. Confirm unified checkout includes account creation, and no import-session request
   has run. Cancel checkout and confirm the source is retained on plans.
4. In a test account, complete checkout. Confirm the reading step starts a session, then opens
   the destination's Overview with **We're moving your site**. Reload and confirm it resumes.
5. Once it's ready, try the thumbs up and thumbs down buttons; thumbs down opens the Help Center.
6. Repeat with an existing destination: a free site requires checkout and a paid site skips it.

## Owned by

@Automattic/dotcom-stepper
