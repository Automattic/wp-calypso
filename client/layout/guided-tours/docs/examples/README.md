# Guided Tours Examples

This directory contains examples for the Guided Tours framework -- both tours and selectors. Use them as inspiration and starting points for your own tours.

## Tours

To try one of the example tours, include it in `client/layout/guided-tours/config.js`. If you want to base your own tour off of an example, copy it to the `../../tours` directory.

When we archive an unused tour as an example, we aim to move all the selectors only used by that tour into the tour itself so they don't affect the build process any longer. When you introduce a tour that uses one of those selectors, remember to move the selector back to where it belongs (e.g. `state/guided-tours/contexts`).

- `simple-payments-end-of-year-guide.js`: This tour was used as a temporary end-of-year advertisement for the Simple Payments feature. It triggers on a variety of paths but only for premium and business users. The tour guides people through the creation of a page and the insertion of a Simple Payments button.

<!--eslint ignore no-heading-punctuation-->

## Selectors etc.

- `hasSelectedSitePremiumOrBusinessPlan` (in `simple-payments-end-of-year-guide.js`): true if the selected site is on the Premium or Business plan.
