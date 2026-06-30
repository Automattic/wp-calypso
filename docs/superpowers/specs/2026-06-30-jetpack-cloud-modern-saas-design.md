# Jetpack Cloud Modern SaaS Design

## Summary

Modernize the authenticated Jetpack Cloud experience with a cohesive SaaS-style visual system while preserving the current Jetpack Cloud color language and page behavior. The redesign applies to logged-in Jetpack Cloud surfaces only. Public pricing, comparison, and marketing pages remain out of scope.

## Scope

Included surfaces:

- Sites dashboard and connect URL flow.
- Overview.
- Plugins wrapper.
- Settings and site credential settings pages.
- Partner Portal pages, including billing, invoices, payment methods, company details, licenses, issue license, assign license, download products, and WPCOM Atomic Hosting.
- Shared authenticated shell elements: sidebar, page layout, top bar, cards, tables, filter/search bars, forms, notices, modals, and responsive mobile cards.

Excluded surfaces:

- Public pricing pages.
- Public comparison pages.
- Public marketing-style Jetpack Cloud entry pages.
- Behavioral rewrites of inherited Calypso plugin/site internals.

## Visual Direction

Use the existing Jetpack Cloud palette as the foundation:

- Light gray app background.
- White work surfaces.
- Jetpack green for primary actions and selected states.
- Existing Studio grays for text, borders, and subdued metadata.
- Warning, error, and informational colors remain semantically consistent with the current system.

The experience should feel more modern and cohesive through:

- A reusable top bar with page title/subtitle on the left and contextual actions on the right.
- Subtle rounded corners on panels, cards, buttons, filters, and table containers.
- Improved page gutters, vertical rhythm, and alignment across authenticated pages.
- Cleaner table/card surfaces with consistent borders and padding.
- Sidebar spacing and active states that feel deliberate without changing navigation structure.

## Architecture

The implementation should be a shared shell polish, not a route-by-route rebuild.

- Add Jetpack Cloud design tokens to `client/jetpack-cloud/style.scss`.
- Extend `client/jetpack-cloud/components/layout` so authenticated pages can share a consistent page top bar, body spacing, bordered sections, and responsive action alignment.
- Align `client/jetpack-cloud/sections/partner-portal/layout` with the Jetpack Cloud layout system because many business pages already use the parallel Partner Portal layout primitives.
- Polish `client/jetpack-cloud/components/sidebar` while preserving its existing menu item structure, events, and site selector behavior.
- Normalize common surfaces through route-local SCSS where the surfaces already exist: dashboard tables/cards, search/filter bars, overview cards, plugin wrapper, settings panels, and Partner Portal cards/forms/lists.

## Component Design

### Page Top Bar

Authenticated pages should use a consistent page top bar:

- Left side: page title and optional subtitle.
- Right side: primary and secondary contextual actions.
- Desktop: single row alignment.
- Tablet/mobile: actions wrap below the title with left alignment.
- Existing sticky license/selection states may remain sticky, but should inherit the same visual treatment where practical.

### Sidebar

Keep the current Jetpack Cloud sidebar component and navigation model. Improve:

- Header spacing and selected-site alignment.
- Menu item height, icon alignment, active background, hover state, and text rhythm.
- Footer item spacing.
- Site selector focus treatment.

### Content Surfaces

Common surfaces should share:

- `8px` default radius for buttons, cards, filter bars, table containers, form fields, and modal sections, matching Calypso's allowed radius scale.
- Consistent 1px borders using Studio gray tokens.
- Restrained shadows only for elevated or active states.
- Predictable spacing between top bar, metrics, filters, tables, cards, and pagination.

### Dashboard

The Sites dashboard should receive the clearest application of the system:

- Page title/actions use the top bar pattern.
- Filter/search bar becomes a coherent panel strip.
- Desktop table receives a bordered container with cleaner row/header spacing.
- Mobile cards and bulk select surfaces align with the same radius, border, and padding system.

### Partner Portal

Partner Portal pages should align visually with the Jetpack Cloud layout without changing their business logic:

- Billing, invoices, payment methods, company details, licenses, and issue-license flows keep their current data and forms.
- Existing layout wrappers get the same page gutters, top bar, body background, and panel styling as the dashboard.
- Form/list/card components receive spacing, border, and radius normalization.

## Behavior

No product behavior changes are intended:

- Navigation routes remain unchanged.
- Data fetching remains unchanged.
- Filtering, bulk actions, license actions, billing actions, settings saves, and modal behavior remain unchanged.
- Tracking events remain unchanged.
- Public pages remain unchanged.

## Testing And Verification

Use focused verification because this is primarily visual polish:

- Run focused unit tests for changed components with existing tests.
- Run TypeScript checking for client code if feasible.
- Run lint/style checks for touched files where practical.
- Start the Jetpack Cloud dev server or use existing local app tooling for visual review.
- Visually verify representative authenticated routes at desktop and mobile widths:
  - `/dashboard`
  - `/dashboard/favorites`
  - `/overview`
  - `/plugins`
  - `/partner-portal/licenses`
  - `/partner-portal/billing`
  - `/partner-portal/payment-methods`
  - `/partner-portal/invoices`
  - `/settings`

## Risks

- Inherited Calypso components may have local CSS assumptions. Mitigate by applying shell-level and route-wrapper polish instead of deep rewrites.
- Public pricing pages share some Jetpack Cloud global styles. Mitigate by scoping authenticated polish under existing Jetpack Cloud app classes and avoiding broad public-page selectors.
- Full `yarn typecheck-client` may be expensive in this repo. Run it if feasible; otherwise run focused tests and document the verification gap in the PR.
