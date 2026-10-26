# static-site-import flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com.

The `site-migration` flow identifies the source and hands non-WordPress ones here with `from` and
`platform`. Opening this flow without them sends you to that identify step. Anything this flow can’t
take is sent back to `site-migration`.

## Steps

| Step                         | Screen                                       |
| ---------------------------- | -------------------------------------------- |
| `static-site-import-reading` | Checking your site, while the session starts |
| `static-site-import-address` | Keep or change your address                  |
| `domains`                    | Domain search                                |
| `plans`                      | Plans                                        |
| `create-site` → `processing` | Site creation, then checkout                 |

The reading step only starts the import session; the capture runs while the user picks an address
and a plan. If the API refuses the source, the step says so and stops there. Any other failure to
start sends the user back to `site-migration`.

After checkout the user lands on the site’s Overview in the dashboard
(`client/dashboard/sites/overview-static-site-import`), which follows the capture, approves the move
once the preview is ready, follows it until it finishes, and then asks whether the site looks right.

State that has to survive checkout is kept in the URL: `from`, `platform`, `importSessionId` and
`domainChoice`.

## Feature flag

`migration/non-wordpress-source`. With it off, the flow isn’t registered and `site-migration` keeps
its previous behavior.

## Testing instructions

1. `yarn start` and go to `/setup/site-migration`.
2. Enter a Wix or Squarespace URL and confirm you pass through
   `/setup/static-site-import/static-site-import-reading` to the address step.
3. Pick an address and a plan, and check out.
4. After checkout, confirm you land on the site’s Overview with **We’re moving your site**. Reload
   it and confirm it resumes.
5. Once it’s ready, try the thumbs up and thumbs down buttons; thumbs down opens the Help Center.

## Owned by

@Automattic/dotcom-stepper

## Context
