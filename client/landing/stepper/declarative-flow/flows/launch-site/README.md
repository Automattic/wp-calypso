# Launch Site Flow

The Stepper replacement for `/start/launch-site`. It takes the owner of a private or coming-soon site through picking a domain and a plan, launches the site, and sends them to checkout when they picked something to buy.

## Flow steps

1. **Domains** (`domains`) – search for a domain, or skip.
2. **Use my domain** (`use-my-domain`) – connect or transfer a domain the user already owns.
3. **Plans** (`plans`) – the launch plans grid: "Keep this plan" or pick a paid plan. A custom domain stays allowed on the free plan.
4. **Launch** (`launch-site`) – launches the site.

`initialize` drops the steps legacy signup would auto-skip, and records `calypso_signup_actions_exclude_step` for each of them:

- **Domains** and **use my domain** are dropped when the site already has a custom domain.
- **Plans** is dropped when the site has a paid plan. A free trial still counts as free, so trial sites can buy the underlying plan.

Logged-out users log in first; the steps are then worked out for their site.

## Query parameters

- `siteSlug` – **Required.** The site to launch. Without it, or for a site that can't be found, the user goes to `/sites`.
- `back_to` – Where Back returns to. Also where the user lands after launch, when there is no `redirect_to`.
- `redirect_to` – Where the user lands after launch (and after checkout).
- `ref` – Passed on to checkout. `wp-admin` (or `wp-admin/…`) returns the user to the site's wp-admin.
- `coupon` – Applied at checkout.
- `dashboard` – Passed on to checkout.
- `new` – Pre-fills the domain search.
- `source` – Picks the domains step's Back target (`site`, `my-home`, `general-settings`).

## After launch

The site is launched **before** checkout, as in legacy `/start/launch-site`. Then:

- **Nothing to buy** – the user goes straight to the destination: `redirect_to`, else `back_to`, else My Home, with the launch celebration on.
- **A domain or plan picked** – they go into the cart (domains get privacy protection where it's supported), and the user goes to checkout. Checkout returns them to the same destination, and skipping checkout still celebrates the launch.

## Testing instructions

1. Create a private site on a free plan without a custom domain.
2. Go to `/setup/launch-site?siteSlug=<site>`.
3. Pick a domain and a paid plan; the site launches and you land in checkout with both in the cart.
4. Repeat with a new site, skipping the domain and keeping the free plan; the site launches and you land on My Home.
