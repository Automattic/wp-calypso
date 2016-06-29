Upgrades
========

This module centralizes the views and controllers that belong to *Upgrades* under the *My Sites* section of Calypso. The routing logic is located in `index.js`.

This module supports a variety of routes that are described in each submodule.

## Initializing checkout flow

To start a plan checkout flow, use appropriate URLS:

- https://wordpress.com/checkout/site.wordpress.com/premium
- https://wordpress.com/checkout/site.wordpress.com/personal
- https://wordpress.com/checkout/site.wordpress.com/business
- https://wordpress.com/checkout/site.jetpack.me/premium
- https://wordpress.com/checkout/site.jetpack.me/professional

Plan routes are sourced from `lib/plans/constants.js`
