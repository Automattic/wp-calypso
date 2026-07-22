# Match the DNS Records Connection Flow to Figma

## Problem

The “I use this domain for my website, email, or other services” path in the Dashboard domain connection flow still uses the previous copy, step treatment, tables, and verification layout.

## Approach

Align the advanced/DNS-records path in `client/dashboard/domains/domain-connection-setup/` with the linked Figma frames. Reuse the shared step and connection-status patterns established by PR #112759 while keeping the DNS-specific copy and behavior independently testable.

## Tasks

- [x] Match the page header, registrar banner, advanced selection, notice, and explanatory copy.
- [x] Match the three DNS-record instruction steps and their progression behavior.
- [x] Match the DNS update and verification table labels, ordering, and copy actions.
- [x] Match the verifying, connecting, and active status layouts and propagation copy.
- [x] Update focused tests and run targeted formatting, linting, unit, and type checks.
- [x] Verify the local flow against Figma in the existing Chrome session.

## Implementation Notes

The linked Figma node contains the DNS-records desktop states with paired mobile frames: Step 1 expanded/complete, Step 2 expanded/complete, Step 3 expanded/complete, Verifying, Connecting, and Active.

The full domain-connection test directory passes (111 tests), along with targeted Prettier, ESLint, and Stylelint checks. The client type-check is blocked by unrelated unresolved `@automattic/date-range-picker` and `@automattic/omnibar` modules in existing Dashboard files.

Chrome verification covered the Figma copy, advanced selection, one-at-a-time step progression, DNS-record table headings and copy actions, enabled completion state, and a clean local reload with no new console errors.
