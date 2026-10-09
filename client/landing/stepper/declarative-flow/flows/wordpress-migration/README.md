# WordPress DIY migration

Destination for the shared migration router's WordPress DIY handoff. This flow is intentionally unfinished: it currently stops at the error step. Plan purchases, checkout, source access, and the migration API integration belong to DOTCOM-18687.

The router handoff is gated by `migration/reprint-flow`, which defaults to false in every environment. The handoff requires a detected WordPress source and a destination site. Existing migrations continue to use their legacy Stepper URLs.

Destination eligibility uses the existing `install-plugins` capability. Destinations that need an upgrade show their source preview, destination, and current plan on the result screen, with “Upgrade and continue” disabled until checkout is implemented. Eligible destinations show a comparison of the current destination and the source site, with a replacement warning. Both previews use 1200×800 desktop captures matching the cards; they show the public site, including its Coming Soon page when applicable. “Replace and continue” hands off to the unfinished DIY flow; “Use a different site” opens the picker with the destination cleared and source context preserved. Without a destination, the source result still leads to plans. Destination data must finish loading before continuation is offered. This applies to supplied destinations and sites selected in the picker; explicit assisted migration links retain their existing routes.

## Handoff context

The router passes `from`, `siteId`, `siteSlug`, `platform`, `host`, `ref`, `source`, `sessionId`, and `backToFlow` in the URL. `ref` retains the original entry point. `flags` is carried for development overrides. Stepper state is scoped by flow as well as session, so the destination must read the supplied context instead of assuming it inherits the router's stored state.

## Testing instructions

1. In development, stage, or Calypso Live, open `/setup/site-migration?flags=migration/reprint-flow`.
2. Identify an external WordPress source and continue from the result screen to “Ready to migrate”. Verify that all four paid plans appear, with purchase buttons disabled.
3. Follow “migrate to a site you already have” and select a destination. Choosing “create a new one” returns to plans without creating a site. Back returns from the picker to plans, and from plans to the source result.
4. Verify that an eligible destination shows the comparison layout, both supplied in the entry URL and selected in the picker. “Use a different site” opens the picker; Back restores the comparison. “Replace and continue” hands off to `/setup/wordpress-migration` with source, destination, and entry context. The error screen is the current placeholder; no migration starts. Repeat with a Free destination, both supplied in the entry URL and selected in the picker: verify the destination upgrade layout appears instead of handing off. Its upgrade button remains disabled. Back returns through the previous pages without a loop.
5. Without the flag, verify the existing destination and DIY choice routes still lead to instructions or an upgrade. Direct flagged plans URLs return to address entry when the flag is off.

## Owned by

@Automattic/jetpack-avalon

## Context

- DOTCOM-18686: Shared migration router.
- DOTCOM-18687: WordPress DIY Reprint sub-flow.
