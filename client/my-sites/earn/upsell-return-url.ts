import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

/**
 * The Monetize page the user is currently on, in the form checkout can redirect
 * back to, so an upgrade started here returns to the tool that prompted it
 * instead of the generic thank-you page.
 *
 * Jetpack Cloud sends people to checkout on WordPress.com, so Cloud needs an
 * absolute URL — `cloud.jetpack.com` is one of the hosts checkout is allowed to
 * redirect back to.
 */
export function getUpsellReturnUrl(): string {
	return isJetpackCloud()
		? window.location.href
		: window.location.pathname + window.location.search + window.location.hash;
}

/**
 * Query args for an upsell linking straight to `/checkout`, which is expected to
 * carry both a post-purchase and a cancel destination.
 *
 * `cancel_to` is only honoured when it is relative (see `leaveCheckout`), so
 * Jetpack Cloud gets none and keeps relying on `checkoutBackUrl`.
 */
export function getUpsellCheckoutQueryArgs(): Record< string, string > {
	const returnUrl = getUpsellReturnUrl();

	return isJetpackCloud()
		? { redirect_to: returnUrl }
		: { redirect_to: returnUrl, cancel_to: returnUrl };
}
