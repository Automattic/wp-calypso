# Checkout

This is the primary Calypso section for making a new purchase or manual renewal for WordPress.com, Jetpack, and Akismet.

For the most part, Checkout consists of the Shopping Cart data layer (via the [@automattic/shopping-cart package](../../../packages/shopping-cart)), and the Checkout view in this section. The shopping cart handles all of the product logic and validation.

## Initializing Checkout flow

To start Checkout, you can either visit Checkout directly (`https://wordpress.com/checkout/site.wordpress.com/`) with an item already added to the shopping cart, or you can initialize Checkout with the required site and product data passed directly via url (`https://wordpress.com/checkout/{site_slug_or_id}/{product_slug}`).

**Examples:**
- `https://wordpress.com/checkout/site.wordpress.com/premium`
- `https://wordpress.com/checkout/site.wordpress.com/personal`
- `https://wordpress.com/checkout/site.jetpack.me/premium`
- `https://wordpress.com/checkout/site.jetpack.me/professional`

Product slugs are sourced from [the constants](../../../packages/calypso-products/constants) in `@automattic/calypso-products`. Some product slug aliases exist (e.g. `value_bundle` -> `premium`), and can be set via the `path_slug` value in `Store_Product_List`.

Multiple products can be passed as comma-separated slugs. Some products (e.g. domain registrations) require meta to be passed in the url via a colon separator. Similarly, quantities for a product can be specified with the `:-q-{quantity}` pattern.

**Example:**
- `https://wordpress.com/checkout/example.wordpress.com/personal,domain_reg:example.com,wp_google_workspace_business_starter_yearly:example.com:-q-12`
