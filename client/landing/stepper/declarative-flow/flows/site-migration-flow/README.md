# Site migration

Shared migration router for source identification, destination selection, and plan selection. WordPress source access and migration execution belong to the Migration Status Dashboard (MSD).

Non-WordPress sources use the existing importer and static-site import routes. Backup upload is deferred and has no entry point in this flow.

## Entry points

- `/setup/site-migration`: the user enters their site address and runs URL/platform analysis before signup or login. WordPress migration requires authentication on the next step. Static-site import continues to public plan selection, with account creation handled by unified checkout.
- Selecting WordPress from the platform list returns to the address form, prefilling any earlier address. Continue keeps the selected WordPress platform and runs the existing analysis to detect WordPress.com hosting. Other detected platforms or analysis failures do not override the manual selection.
- `/setup/site-migration/site-migration-identify?from=<url>&start=true`: hands over an address the user already submitted elsewhere, such as a landing page. Identify checks it once on arrival; going back to identify shows the address form.
- Landing pages built with landpack's `url-analyzer` block (e.g. `/move`) currently run their own analysis and link WordPress sources to `sitePicker?from=<url>&platform=wordpress&start=true`. `initialize` rewrites those to identify. Point the block at identify and drop its routing and this rewrite.
- Leftover links to the removed `site-migration-instructions` step (the legacy migration key workflow) are rewritten to identify by `initialize`, keeping their query string.

## Handoff

- New destination: choose a plan → create site → configure → checkout → site migration page.
- Eligible existing destination: confirm replacement → configure → site migration page.
- Existing destination needing an upgrade: choose a plan → configure → checkout → site migration page.

Choosing "I'll do it myself" on how-to-migrate continues to the site checks when the source is WordPress and a destination is known; otherwise it starts over at identify.

Configure saves only `source_url`. It resets migration state, so it runs after an explicit continuation, never merely opening a result or plans page. MSD owns choosing the source connection and starting the migration; this router does not call the run endpoint. Configure failures use the shared Stepper error screen.

Checkout returns to the destination's migration page in MSD. Cancelling checkout returns to plans with the destination and source context retained, so continuing reuses the created site. Entry attribution, session, and development flags survive the handoff.

## Testing instructions

1. Open `/setup/site-migration` while signed out. Verify the address form and URL/platform analysis run before signup or login, then authentication resumes the next step with the source and hosting details retained.
2. Enter a WordPress source. Verify the loading, unreachable, HTTP, and already-on-WordPress.com states as appropriate.
3. Without a destination, continue to plans. Select a plan to create a site, or choose an existing site.
4. For an eligible destination, verify the before/after comparison. For an ineligible destination, verify the upgrade action opens plans.
5. In a test account, continue and verify one configure request containing only the source URL, followed by checkout or the destination's migration page. Do not use a destination with an active migration: configure resets migration state.
6. Verify configure failure opens the error screen, repeated clicks do not duplicate requests, and opening or refreshing results/plans does not configure.
7. Cancel checkout and verify plans retains the created destination. Verify Back through picker, plans, result, and address entry.
8. Verify non-WordPress sources retain their existing routes. Open `/setup/site-migration/site-migration-instructions?siteSlug=<site>&siteId=<id>` and verify it lands on identify with the query string kept.
9. Open `/setup/site-migration/sitePicker?from=<url>&platform=wordpress&start=true&ref=move-lp` (what `/move` sends). Verify a single page load straight into "Checking your site", then Back shows the address form.
10. Select WordPress manually and enter a WordPress.com source. Verify the WordPress.com choices still appear. A different detected platform or failed analysis must retain the manual WordPress selection.
11. On the WordPress.com choices screen, select the top option to migrate into this site from elsewhere. The option requires a resolved Simple or Atomic site with management access, excluding staging and deleted sites; it stays hidden while loading or if lookup fails. Verify address entry opens empty, the entered WordPress.com site becomes the destination (replacing any earlier selection), and the next source is analyzed afresh. Continue with an external WordPress source and verify the destination comparison appears before configuring a migration.
12. With a selected destination, enter its current or default address as the source. Verify the form explains that this is the destination and does not analyze or continue. Check HTTP/HTTPS, `www`, and trailing paths, then enter a different source and verify the error clears and checking continues.

## Owned by

@Automattic/jetpack-avalon

## Context

DOTCOM-18686: shared migration router. DOTCOM-18687: WordPress migration continuation.
