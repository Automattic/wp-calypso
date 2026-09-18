# static-site-import flow

Moves a site built on another platform (Wix, Squarespace, and similar) to WordPress.com.

The `site-migration` flow hands non-WordPress sources to this flow from its identify step. Anything
this flow can’t take is sent back to `site-migration`.

## Steps

| Step                              | Screen                              |
| --------------------------------- | ----------------------------------- |
| `site-migration-identify`         | Let’s find your site                |
| `static-site-import-reading`      | Reading your site                   |
| `static-site-import-results`      | Your site is ready to move          |
| `static-site-import-how-it-works` | Here’s how the move works           |
| `static-site-import-address`      | Keep or change your address         |
| `domains`                         | Domain search                       |
| `plans`                           | Plans                               |
| `create-site` → `processing`      | Site creation, then checkout        |
| `static-site-import-ready`        | You’re all set                      |
| `static-site-import-building`     | We’re building your site            |
| `static-site-import-done`         | Your site is ready                  |
| `static-site-import-expert`       | A migration expert will be in touch |
| `static-site-import-failed`       | We couldn’t finish your move        |

State that has to survive checkout is kept in the URL: `from`, `platform`, `importSessionId`,
`domainChoice`, `siteId` and `siteSlug`.

## Feature flag

`migration/non-wordpress-source`. With it off, the flow isn’t registered and `site-migration` keeps
its previous behavior.

## Testing instructions

1. `yarn start` and go to `/setup/site-migration`.
2. Enter a Wix or Squarespace URL and confirm you land on
   `/setup/static-site-import/static-site-import-reading`.
3. Walk through the results, how-it-works and address screens, then pick a plan and check out.
4. After checkout, click **Move my site**. Reload the building screen and confirm it resumes.
5. On the done screen, try **Something’s off** → **Get help with this** and check the expert screen.

## Owned by

@Automattic/dotcom-stepper

## Context

