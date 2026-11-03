# static-site-import flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com.

The `site-migration` flow identifies the source without requiring an account and hands
non-WordPress sources here with `from` and `platform` when the URL analyzer reports
`static_site_importable`: a working site that is neither WordPress nor a parked domain. Parked
and unhealthy sites keep the previous behavior. Landing pages such as `/move` link to
the plans step directly using the same analyzer field.
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
tracks capture and import in the background, then offers the finished site with a way to hand the
move to our migrations team.

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

## Feature flag

`migration/non-wordpress-source`. With it off, the flow isn’t registered and `site-migration` keeps
its previous behavior.

## Testing instructions

1. Run `yarn start` and open `/setup/site-migration` while signed out.
2. Enter a Wix or Squarespace URL. Confirm analysis finishes and opens
   `/setup/static-site-import/plans` without signup or login.
3. Pick a plan. Confirm unified checkout includes account creation, and no import-session request
   has run. Cancel checkout and confirm the source is retained on plans.
4. In a test account, complete checkout. Confirm the reading step starts a session, then opens
   the destination’s Overview with **We’re moving your site**. Reload and confirm it resumes.
5. Once it’s ready, click **Something not right? Let our team fix it** and confirm it files a migration
   ticket. A move that found a store, bookings, or memberships names it and offers **Let our team finish
   your move** instead.
6. Repeat with an existing destination: a free site requires checkout and a paid site skips it.
   Confirm that a direct reading link shows the destination and requires clicking **Import into
   this site**, even with `newSite=1` or an existing `importSessionId` in the URL.

## Owned by

@Automattic/dotcom-stepper
