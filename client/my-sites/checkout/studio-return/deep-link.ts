import { addQueryArgs } from '@wordpress/url';

// The Studio desktop app registers this scheme with the OS. Navigating to it prompts the browser
// to hand off to the app; if Studio is not installed the navigation fails and the current page
// stays put, which is why every caller must also offer a manual affordance.
const STUDIO_URL_SCHEME = 'wp-studio';
const CHECKOUT_RETURN_ACTION = 'checkout-return';

export type StudioCheckoutResult = 'success' | 'cancelled';

export interface StudioCheckoutReturnParams {
	studioSiteId: string;
	checkoutResult: StudioCheckoutResult;
	studioReturnTo?: string;
}

/**
 * Builds the `wp-studio://` URL that hands the user back to Studio after checkout.
 *
 * The payload is deliberately minimal: `studioSiteId` is the only value Studio cannot derive, and
 * `checkoutResult` distinguishes the two outcomes. Everything else — the purchased quantity, the
 * receipt, the resulting credit balance — must come from the API, because any web page can navigate
 * to this URL and Studio therefore cannot trust it as proof of purchase.
 */
export function buildStudioCheckoutReturnUrl( {
	studioSiteId,
	checkoutResult,
	studioReturnTo,
}: StudioCheckoutReturnParams ): string {
	return addQueryArgs( `${ STUDIO_URL_SCHEME }://${ CHECKOUT_RETURN_ACTION }`, {
		studioSiteId,
		checkoutResult,
		...( studioReturnTo ? { studioReturnTo } : {} ),
	} );
}

/**
 * Hands off to Studio.
 *
 * Unlike the site-creation round trip in
 * `calypso/my-sites/customer-home/components/home-content/studio-deeplink`, this does not retry the
 * legacy `wpcom-local-dev://` scheme. Any Studio build old enough to need that scheme predates the
 * `checkout-return` handler, so the retry could never succeed — it would only cost a second browser
 * dialog for users without Studio installed.
 */
export function openStudioCheckoutReturn( params: StudioCheckoutReturnParams ): void {
	window.location.href = buildStudioCheckoutReturnUrl( params );
}
