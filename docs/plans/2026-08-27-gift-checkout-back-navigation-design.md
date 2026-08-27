# Gift checkout "Back" navigation — design

Linear: DOTOBRD-600

## Problem

A visitor who clicks the "gift this site a plan" banner lands on
`/checkout/<plan>/gift/<subscription_id>?cancel_to=/home`. Clicking the
"< Back" link in the checkout top bar sends them to `/home`:

- logged in, `/home` resolves to the landing page of *their* primary site
  (WP Admin or `/home/<slug>`), not the site they were gifting;
- logged out, `/home` bounces to `/log-in?redirect_to=%2Fhome`.

The banner hardcodes `cancel_to=/home` and checkout never consults the
referrer or the gifted site.

## Scope

Gift checkout only. Stepper first-step "Back" behaviour for other flows is a
separate follow-up.

## Decision

Fix in Calypso only. Do not change the wpcom banner: `cancel_to` rejects
external hosts, and the cart already carries the gifted site as
`ResponseCart.gift_details.receiver_blog_url` (server-provided, so there is
no open-redirect risk).

## Resolution

New pure helper `client/my-sites/checkout/src/lib/get-gift-checkout-back-url.ts`:

```ts
getGiftCheckoutBackUrl( { giftDetails, referrer } ): string | undefined
```

1. No `giftDetails?.receiver_blog_url` → `undefined`. Existing behaviour.
2. Referrer parses, is `http:`/`https:`, and its `host` equals the
   receiver's `host` → return the referrer (full URL, keeps the path when the
   site's Referrer-Policy sends it).
3. Otherwise → return `receiver_blog_url`.

The referrer is only trusted when its host matches the server-provided
receiver host; the check is host equality, not registrable domain.
`document.referrer` is fixed at document load and the banner is a full-page
link, so reading it at click time is safe. Parsing errors return `undefined`.

## Wiring

In `useCheckoutLeaveModal` (`leave-checkout-modal.tsx`):

```ts
const giftBackUrl = getGiftCheckoutBackUrl( {
	giftDetails: responseCart.gift_details,
	referrer: document.referrer,
} );
// closeAndLeave
forceCheckoutBackUrl: options?.forceBackUrl ?? stepBackUrl ?? forceCheckoutBackUrl ?? giftBackUrl,
```

Precedence: explicit step-back URL → validated `?checkoutBackUrl=` → gift
URL → `leaveCheckout` defaults (`cancel_to`, `history_back`, previous path,
`/plans/:site`, `/start`). `forceCheckoutBackUrl` is checked before
`cancel_to` in `leaveCheckout`, so the banner's `/home` is never reached for
a gift cart. Both the plain Back and the "empty cart and leave" modal path
fall through to the gift URL. Logged-out gifters run the same code because
checkout still loads the gift cart for them. `leaveCheckout` and
`masterbar/checkout.tsx` are unchanged.

## Testing

Unit:

- `lib/test/get-gift-checkout-back-url.ts`: no gift details; referrer host
  matches (path preserved); referrer on another host; empty referrer;
  unparsable receiver / non-http referrer.
- `components/test/leave-checkout-modal.test.tsx`: gift cart with mocked
  `document.referrer`; `clickClose` and `clearCartAndLeave` pass the site
  as `forceCheckoutBackUrl`; an explicit step-back / `checkoutBackUrl`
  still wins.

E2E (best effort): `specs/plans/plans__gift-checkout-back.spec.ts` — as
`accountDefaultUser`, look up the site's plan subscription via
`clientRestAPI`, `page.goto( giftCheckoutUrl, { referer: siteUrl } )`, click
Back, assert the URL starts with the site URL; incognito variant for the
logged-out case. If the server refuses gift checkout for a site without
`wpcom_gifting_subscription` and the option cannot be enabled via API, drop
the spec and say so in the PR.

Manual: sandbox gifting banner → checkout → Back, logged in and out.
