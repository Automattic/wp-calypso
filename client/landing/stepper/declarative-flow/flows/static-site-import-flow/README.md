# static-site-import flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com.

The `site-migration` flow identifies the source and hands non-WordPress ones here with `from` and
`platform`. Opening this flow without them sends you to that identify step. Anything this flow can’t
take is sent back to `site-migration`.

## Steps

| Step                         | Screen                                                   |
| ---------------------------- | -------------------------------------------------------- |
| `static-site-import-reading` | Checking your site                                       |
| `static-site-import-results` | We can move your site (or almost all / some parts can’t) |
| `static-site-import-expert`  | A migration expert will be in touch                      |
| `static-site-import-address` | Keep or change your address                              |
| `domains`                    | Domain search                                            |
| `plans`                      | Plans                                                    |
| `create-site` → `processing` | Site creation, then checkout                             |

The results screen picks its version from the session’s `preview_summary` (see
`components/static-site-import/confidence.ts`): a store, bookings or member logins mean some parts
can’t be moved; forms, embeds, sections that didn’t convert cleanly, pages that look different or
pages that weren’t found are things to set up after the move; otherwise the whole site can move.

After checkout the user lands on the site’s Overview in the dashboard
(`client/dashboard/sites/overview-static-site-import`), which approves the move, follows it until
it finishes, and then asks whether the site looks right.

State that has to survive checkout is kept in the URL: `from`, `platform`, `importSessionId` and
`domainChoice`.

## Feature flag

`migration/non-wordpress-source`. With it off, the flow isn’t registered and `site-migration` keeps
its previous behavior.

## Testing instructions

1. `yarn start` and go to `/setup/site-migration`.
2. Enter a Wix or Squarespace URL and confirm you land on
   `/setup/static-site-import/static-site-import-reading`.
3. On the results screen, click **Move my site**, pick an address and a plan, and check out.
4. After checkout, confirm you land on the site’s Overview with **We’re moving your site**. Reload
   it and confirm it resumes.
5. Once it’s ready, try the thumbs up and thumbs down buttons; thumbs down opens the Help Center.

## Owned by

@Automattic/dotcom-stepper

## Context
