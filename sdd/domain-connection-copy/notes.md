# Match Domain Connection Flow to Figma

## Problem

The domain connection entry, name-server setup, and connection-status states no longer match the “Domains — Connect” Figma designs.

## Approach

Keep the completed onboarding copy changes, then align the Dashboard name-server flow in `client/dashboard/domains/domain-connection-setup/` with Figma. Reuse the existing WordPress component and icon primitives for step status, disclosure, notices, external links, and copy actions.

## Tasks

- [x] Match the enter-domain heading and subtitle to Figma.
- [x] Match the path-selection heading and subtitle to Figma.
- [x] Match the transfer/connect card titles, descriptions, and benefits to Figma.
- [x] Run targeted formatting and verification, then review the diff.
- [x] Match the Dashboard connection page header, registrar banner, mode copy, and notices.
- [x] Match the three name-server instruction states and preserve their accordion behavior.
- [x] Match the name-server update and verification tables, including copy actions and column order.
- [x] Match the verifying, connecting, and active connection-status layouts.
- [x] Update focused tests and run targeted formatting, linting, and unit checks.
- [x] Remove the pointer-focus halo from the connection mode radios while preserving keyboard focus.

## Implementation Notes

Figma MCP access reached the View-seat quota while inspecting individual layers. The remaining copy was verified visually in the linked Figma file through the existing browser session.

Implementation matched the planned copy updates with no deviations. Targeted Prettier and ESLint checks pass. The full client type-check is blocked by unrelated unresolved `@automattic/date-range-picker` and `@automattic/omnibar` modules in existing Dashboard files.

The follow-up work maps to the newer Dashboard implementation rather than the legacy `client/components/domains/connect-domain-step/` wizard. Figma verification was performed in the existing logged-in Chrome session across the Step 1, Step 2, Step 3, Verifying, Connecting, and Active desktop frames, with their paired mobile layouts visible alongside them.

The selected connection mode used the component's `:focus` shadow after pointer interaction, creating a second blue ring around the standard selected radio. The local override is scoped to non-`:focus-visible` focus so keyboard users retain the focus indicator.

The follow-up centers the setup header with an additional 12px of space before the registrar banner. Step progression uses the handler that already existed on trunk; the PR does not introduce new progression logic or test coverage for existing behavior.

The name-server update table assigns the flexible width to the “Change to” column and keeps the copy action content-sized so target name servers remain readable on desktop.
