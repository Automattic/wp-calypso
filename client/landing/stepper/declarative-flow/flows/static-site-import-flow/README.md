# static-site-import flow

Moves a non-WordPress site (Wix, Squarespace, and other static sources) to WordPress.com. A sandbox
reads and rebuilds the site before anything is bought; after checkout the user approves the move
and the rebuilt site is delivered to their new site.

The regular `site-migration` flow hands non-WordPress sources to this flow from its identify step.
Anything this flow cannot take (WordPress sources, unknown platforms, a disabled or failed read)
goes back to `site-migration`, which ends in the content-only importer as before.

## Steps

| Step                              | Screen                              |
| --------------------------------- | ----------------------------------- |
| `site-migration-identify`         | Let’s find your site                |
| `static-site-import-reading`      | Reading your site                   |
| `static-site-import-results`      | Your site is ready to move          |
| `static-site-import-how-it-works` | Here’s how the move works           |
| `static-site-import-address`      | Keep or change your address         |
| `domains` (register only)         | Domain search                       |
| `plans`                           | Plans (paid plans only)             |
| `create-site` → `processing`      | Site creation, then checkout        |
| `static-site-import-ready`        | You’re all set (after checkout)     |
| `static-site-import-building`     | We’re building your site            |
| `static-site-import-done`         | Your site is ready                  |
| `static-site-import-expert`       | A migration expert will be in touch |
| `static-site-import-failed`       | We couldn’t finish your move        |

Everything that has to survive checkout lives in the URL: `from`, `platform`, `importSessionId`,
`domainChoice`, `siteId` and `siteSlug`. The building step can be left and reopened from its URL.

"Keep my domain" adds no domain product to the cart. The domain is connected from the done screen,
once the user has checked the rebuilt site.

## API

`wpcom/v2/static-site-import-session` (see `@automattic/api-core`'s `static-site-import-session`):

- `POST /static-site-import-session { source_url }` starts reading a site. No site is needed yet.
- `GET /static-site-import-session/{id}` reports `state`: `capture_queued` → `capturing` →
  `building` → `preview_ready` → (approve) → `queued` → `finished` | `failed`.
- `POST /static-site-import-session/{id}/approve { archive_hash, destination_blog_id }` binds the
  destination and queues the delivery.

Sessions belong to the user who started them and expire three days after the preview is ready.

## Feature flag

`migration/non-wordpress-source`. With it off the flow is not registered and `site-migration`
sends non-WordPress sources to the content importer, as before.

The backend is also gated: creating a session needs an Automattician, and approving onto a site
needs the `static-site-import` blog sticker on it.

## Testing instructions

1. Apply the wpcom static-site import patches to your sandbox and point `public-api.wordpress.com`
   at it.
2. `yarn start` and go to `/setup/site-migration`. Enter a Wix or Squarespace URL and confirm you
   land on `/setup/static-site-import/static-site-import-reading`.
3. Walk through the results, how-it-works and address screens, pick a plan and pay.
4. Before clicking **Move my site**, add the sticker to the new site:
   `wp --blog-id=<id> blog-stickers add --sticker=static-site-import --who=<you>`.
5. Reload the building screen while it runs, and confirm it picks up where it was.
6. On the done screen, try **Something’s off** → **Get help with this**, and check the expert screen.

## Owned by

@Automattic/dotcom-stepper

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
