# See it first

Moves a site built on another platform (Wix, Squarespace, Lovable and similar) to WordPress.com, showing the customer their site **before** they pay. Until checkout the "preview" is a screenshot of the site as it is today; nothing is created or copied until the plan is bought.

## Steps

| Step                         | Screen                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `site-migration-identify`    | Enter the current site's address, as on `/move`. No account needed.                |
| `user`                       | Create an account or log in.                                                       |
| `see-it-first-preview`       | A pitch with **Continue** on the left; the site's screenshot fills the right half. |
| Unified checkout             | WordPress.com Personal. Checkout creates the new site.                             |
| `static-site-import-reading` | Starts the move onto the new site, as `static-site-import` does.                   |
| Dashboard Overview           | The new site, tracking the move.                                                   |

`/move` and similar landing pages can skip the address screen's input with `?from=<address>&start=true`: the address is checked as soon as the step loads.

## How the preview works

The preview step pitches the move on the left, and a long mShots screenshot of `from` (767×3072, about four screens of the site) fills the right half of the page edge to edge and scrolls on its own. On phones it stacks under the pitch.

mShots captures a size it hasn't made before only when asked to requeue, which takes a few seconds and shows its "Generating Preview" placeholder meanwhile. So the flow asks once, when the address step confirms a source (`requestLongScreenshot()` in the step's `screenshot.ts`), and signing in gives it time to finish. The step itself doesn't ask again, which would restart the capture. On a local dev server the screenshot stays on its spinner: the thumbnail checks on mShots with a request only wordpress.com's origin may make.

**Continue** goes to unified checkout for the Personal plan, as `static-site-import`'s plans step does. Checkout creates the site and returns to the reading step with `newSite=1` and the new `siteId`, which records the signup, starts the import session and opens the site's Overview with its `importSessionId`. Leaving checkout returns to the screenshot.

Only a source that the URL analyzer reports as `static_site_importable` gets the screenshot. Anything else, including WordPress sites, goes to the `site-migration` flow with the address. After checkout, the reading step's other outcomes go where `static-site-import` sends them: a WordPress source to `site-migration`'s check step for the new site, and a source the import can't take to the platform's importer.

## Feature flags

`migration/see-it-first` and `migration/non-wordpress-source`. The flow is registered only with both on.

## Not built yet

- The prototype's "Free until <date>" bar copy, and **Edit site**: there is no site until checkout.
- The dashboard's "This site is yours" notice after checkout.

## Testing instructions

1. Signed out, open `/setup/see-it-first`.
2. Enter a Wix or Squarespace address. Confirm the address is checked and you're asked to create an account or log in.
3. Log in. Confirm the pitch, naming the site's address, shows on the left with **Continue**, the site's screenshot filling the right half and scrolling through the page, and that no site or import was created.
4. Click **Continue**. Confirm unified checkout shows WordPress.com Personal. Click **Back** and confirm the screenshot shows again.
5. Complete checkout in a test account. Confirm you land on the new site's Overview, which shows the move in progress.
6. Open `/setup/see-it-first?from=<a WordPress site>&start=true`. Confirm you're sent to the `site-migration` flow with the address.

## Owned by

TBD

## Context

Prototype: see-it-first-prototype on Spacefast.
