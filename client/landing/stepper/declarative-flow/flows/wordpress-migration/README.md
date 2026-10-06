# WordPress DIY migration

Destination for the shared migration router's WordPress DIY handoff. This flow is intentionally unfinished: it currently stops at the error step. Plans, checkout, source access, and the migration API integration belong to DOTCOM-18687.

The router handoff is gated by `migration/reprint-flow`, which defaults to false in every environment. The handoff requires a detected WordPress source and a destination site. Existing migrations continue to use their legacy Stepper URLs.

## Handoff context

The router passes `from`, `siteId`, `siteSlug`, `platform`, `host`, `ref`, `source`, `sessionId`, and `backToFlow` in the URL. `ref` retains the original entry point. `flags` is carried for development overrides. Stepper state is scoped by flow as well as session, so the destination must read the supplied context instead of assuming it inherits the router's stored state.

## Testing instructions

1. In development, stage, or Calypso Live, open `/setup/site-migration?flags=migration/reprint-flow`.
2. Identify a WordPress source and choose or create a destination site.
3. Choose “I'll do it myself”.
4. Verify the handoff to `/setup/wordpress-migration` retains source, destination, and entry context. The error screen is the current placeholder; no migration starts.
5. Without the flag, verify DIY uses the existing instructions or upgrade step. With either flag setting, DIFM and content import retain their existing routes.

## Owned by

@Automattic/jetpack-avalon

## Context

- DOTCOM-18686: Shared migration router.
- DOTCOM-18687: WordPress DIY Reprint sub-flow.
