# Direct-to-Cart URL — Integration Guide

The `/setup/direct-to-cart` URL drops a user into WordPress.com checkout with a pre-selected paid plan, an auto-generated free subdomain, and a guaranteed atomic site. After the user completes checkout and atomic transfer finishes, they are redirected back to a URL of your choosing.

This doc is the **source of truth** for the URL contract.

## URL shape

```
https://wordpress.com/setup/direct-to-cart
  ?plan=<plan-slug>
  &redirect_to=<https-url>
  &integration=<your-integration-id>
  &context_id=<your-per-context-id>
  &title=<site-title>
  &coupon=<coupon-code>
  &ref=<source-tag>
```

## Required parameters

### `plan`

A WordPress.com paid plan slug that triggers an atomic site transfer. Currently supported:

- `business-bundle` (annual), `business-bundle-monthly`, `business-bundle-2y`, `business-bundle-3y`
- `ecommerce-bundle` (annual), `ecommerce-bundle-monthly`, `ecommerce-bundle-2y`, `ecommerce-bundle-3y`
- Hosting trial plan slugs (consult the Calypso `isFreeHostingTrial` helper)

Any other plan slug will be rejected — the user lands on an "unsupported plan" notice page with a link to `/plans`. Personal, Premium, and Free plans do **not** result in an atomic site and are intentionally excluded.

## Optional parameters

### `redirect_to`

An https URL the user is redirected to after their purchase completes and the atomic transfer finishes (typically 5–15 minutes after checkout).

- Must be **https** outside of local development.
- Hostname must be in the WordPress.com checkout allowlist. Coordinate with the WordPress.com team to add new hostnames.
- When the user returns, the URL is augmented with `wpcom_purchase=1&wpcom_site=<siteSlug>` so your integration can confirm the purchase happened and identify the site.

If `redirect_to` is missing or rejected, the user lands on the WordPress.com site home (`/home/<siteSlug>`) instead.

### `integration`

A short opaque identifier for your integration (e.g., `telex`). Pattern: `^[a-z0-9-]{1,32}$`. Recorded in Tracks events for analytics attribution.

### `context_id`

A unique per-context identifier (e.g., a project ID in your system). Pattern: `^[a-z0-9-]{1,64}$`.

**This is the resumability key.** If a user visits the same URL with the same `(integration, context_id)` tuple twice — for example, by reloading the original link — the flow recognizes the second visit and avoids creating a duplicate site:

- If they have already completed purchase: skip directly to your `redirect_to`.
- If they created a site but didn't yet purchase: skip back to checkout for the existing site.
- If you pass a different plan slug: treat as a new request and create a new site.

**Always pass a unique `context_id` per logical context.** Without it, the same integration always resumes its single previous site. If your integration represents "projects," use the project ID.

### `title`

Site title to pre-populate during creation. Length-capped at 80 characters; HTML-stripped. Used purely cosmetically — the user can edit it later.

### `coupon`

A coupon code applied at checkout. Validation happens in checkout itself.

### `ref`

A free-form source tag recorded in our analytics. Useful for measuring which of your surfaces drives conversions.

## What the user experiences

1. Click link → land on WordPress.com.
2. If logged out: sign in / sign up (Stepper's built-in auth flow).
3. Site is created automatically with a free `*.wordpress.com` subdomain.
4. Checkout for the requested plan.
5. ~5–15 minutes on a "your site is being prepared" interstitial (atomic transfer).
6. Redirected back to your `redirect_to` with `?wpcom_purchase=1&wpcom_site=<slug>` appended.

## Operational runbook

| Symptom                                               | First check                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Users land on `/home/<slug>` instead of returning     | Tracks: `calypso_direct_to_cart_invalid_redirect` volume. Likely allowlist mismatch (you moved domains? check config).                                 |
| No `wpcom_purchase=1` on returns                      | Tracks: `calypso_signup_complete` for `flow=direct-to-cart` vs. start volume. If a gap, check logstash for sanitization failures or PROCESSING errors. |
| Sudden spike in `calypso_direct_to_cart_invalid_plan` | URL-builder regression on your side; check the plan slugs you're emitting.                                                                             |
| Atomic transfer never completes                       | WordPress.com hosting issue — escalate. User is parked on `/setup/transferring-hosted-site`.                                                           |

## Adding your hostname to the allowlist

Coordinate with the WordPress.com Calypso team. The change is in `config/<env>.json` under the key `checkout_additional_allowed_redirect_hosts`. Production additions go through normal Calypso code review.
