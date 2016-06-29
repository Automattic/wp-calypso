Plans
======

This is the Plans React component that renders the /plans/ route.

Supported routes:

```
/plans
/plans/:site_domain
/plans/compare
/plans/compare/:site_domain
/plans/select/:site/:plan - deprecated, use /checkout/:site/:plan
```

### plans.jsx
React component that renders a list of active WordPress.com plans

### plans-compare.jsx
React component that renders a comparison table of active WordPress.com plans

## Initializing checkout flow

To start a plan checkout flow, use appropriate URLS:

- /checkout/site.wordpress.com/premium
- /checkout/site.wordpress.com/personal
- /checkout/site.wordpress.com/business
- /checkout/site.jetpack.me/premium
- /checkout/site.jetpack.me/professional

Plan routes are sourced from `lib/plans/constants.js`. Checkout flow is handled by `my-sites/upgrades/checkout/checkout.jsx`

