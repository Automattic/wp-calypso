# domain-and-plan flow

Lets the owner of an existing site add a custom domain and, when the site's plan doesn't
include one, pick a plan on the way to checkout. Entry points include the dashboard's free
domain CTAs, the launchpad domain task and the customer home domain upsell.

## Testing instructions

1. With a site on the Free plan, go to `/setup/domain-and-plan?siteSlug=<site slug>`.
2. Verify: every step renders the default Stepper header (a top bar with the Back button),
   not the legacy WordPress logo header.
3. Search for a domain, pick a suggestion and continue.
4. Verify: the plans step opens with the picked domain named in its heading and no billing
   interval selector; the Back button returns to the domain search.
5. Pick a plan.
6. Verify: checkout opens with the plan and the domain in the cart.
7. Repeat with a site on a yearly paid plan.
8. Verify: picking a domain goes straight to checkout, skipping the plans step.

## Owned by

@alshakero (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
