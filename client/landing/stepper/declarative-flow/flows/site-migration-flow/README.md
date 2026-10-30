# Site migration

Shared migration router for source identification, destination selection, and plan selection. WordPress source access and migration execution belong to the Migration Status Dashboard (MSD).

The WordPress journey is gated by `migration/reprint-flow`, which defaults to false. Non-WordPress sources retain the existing importer and static-site import routes. Backup upload is deferred and has no entry point in this flow.

## Entry points

- `/setup/site-migration`: the user enters their site address and runs URL/platform analysis before signup or login. WordPress migration requires authentication on the next step. Static-site import continues to public plan selection, with account creation handled by unified checkout.
- `/setup/site-migration/site-migration-identify?from=<url>&start=true`: hands over an address the user already submitted elsewhere, such as a landing page. With the flag on, identify checks it once on arrival; going back to identify shows the address form.
- Landing pages built with landpack's `url-analyzer` block (e.g. `/move`) currently run their own analysis and link WordPress sources to `sitePicker?from=<url>&platform=wordpress&start=true`. With the flag on, `initialize` rewrites those to identify. Once the flag ships, point the block at identify and drop its routing and this rewrite.

## Handoff

- New destination: choose a plan → create site → configure → checkout → site migration page.
- Eligible existing destination: confirm replacement → configure → site migration page.
- Existing destination needing an upgrade: choose a plan → configure → checkout → site migration page.
- “Talk to a migration expert” on the WordPress result: select or create a destination → existing assisted-migration offer → upgrade if needed → credentials. This preserves `how=difm`, including for supported SSH hosts, and does not configure a Reprint migration.

Configure saves only `source_url`. It resets migration state, so it runs after an explicit continuation, never merely opening a result or plans page. MSD owns choosing the source connection and starting the migration; this router does not call the run endpoint. Configure failures use the shared Stepper error screen.

Checkout returns to the destination's migration page in MSD. Cancelling checkout returns to plans with the destination and source context retained, so continuing reuses the created site. Entry attribution, session, and development flags survive the handoff.

## Testing instructions

1. Open `/setup/site-migration?flags=migration/reprint-flow` while signed out. Verify the address form and URL/platform analysis run before signup or login, then authentication resumes the next step with the source and hosting details retained. Without the flag, verify that signing in to an account without sites goes straight to site creation, with Back returning to identify, and that any other account sees the site picker.
2. Enter a WordPress source. Verify the loading, unreachable, HTTP, and already-on-WordPress.com states as appropriate.
3. Without a destination, continue to plans. Select a plan to create a site, or choose an existing site.
4. For an eligible destination, verify the before/after comparison. For an ineligible destination, verify the upgrade action opens plans.
5. In a test account, continue and verify one configure request containing only the source URL, followed by checkout or the destination's migration page. Do not use a destination with an active migration: configure resets migration state.
6. Verify configure failure opens the error screen, repeated clicks do not duplicate requests, and opening or refreshing results/plans does not configure.
7. Cancel checkout and verify plans retains the created destination. Verify Back through picker, plans, result, and address entry.
8. With and without the flag, verify non-WordPress sources retain their existing routes. With the flag off, WordPress migration retains the legacy workflow.
9. Open `/setup/site-migration/sitePicker?from=<url>&platform=wordpress&start=true&ref=move-lp&flags=migration/reprint-flow` (what `/move` sends). Verify a single page load straight into "Checking your site", then Back shows the address form. Without the flag, verify the site picker.
10. On the WordPress result without a destination, choose “Talk to a migration expert”. Verify destination selection or creation retains the source and entry context, then opens “Let us migrate your site”. Check a supported SSH host with `/move` attribution too. Back should return to the result with DIY Continue still available. Stop before purchasing a plan, submitting credentials, or requesting a migration.

## Owned by

@Automattic/jetpack-avalon

## Context

DOTCOM-18686: shared migration router. DOTCOM-18687: WordPress migration continuation.
