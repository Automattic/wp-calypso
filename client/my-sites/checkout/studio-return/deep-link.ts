import { addQueryArgs } from '@wordpress/url';
import type { StudioSyncConnectParams } from './round-trip';

// The Studio desktop app registers this scheme with the OS. Navigating to it prompts the browser
// to hand off to the app; if Studio is not installed the navigation fails and the current page
// stays put, which is why every caller must also offer a manual affordance.
const STUDIO_URL_SCHEME = 'wp-studio';
const CHECKOUT_RETURN_ACTION = 'checkout-return';
const SYNC_CONNECT_SITE_ACTION = 'sync-connect-site';

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
 * This does not retry the legacy `wpcom-local-dev://` scheme. Any Studio build old enough to need
 * that scheme predates the `checkout-return` handler, so the retry could never succeed — it would
 * only cost a second browser dialog for users without Studio installed.
 */
export function openStudioCheckoutReturn( params: StudioCheckoutReturnParams ): void {
	window.location.href = buildStudioCheckoutReturnUrl( params );
}

/**
 * Builds the `wp-studio://` URL that tells Studio to connect a local site to the WordPress.com site
 * its publish flow just created, and optionally open Push.
 */
export function buildStudioSyncConnectUrl( {
	studioSiteId,
	remoteSiteId,
	autoOpenPush,
}: StudioSyncConnectParams ): string {
	return addQueryArgs( `${ STUDIO_URL_SCHEME }://${ SYNC_CONNECT_SITE_ACTION }`, {
		studioSiteId,
		remoteSiteId,
		...( autoOpenPush ? { autoOpenPush: 'true' } : {} ),
	} );
}

/**
 * Hands off to Studio to connect the new site.
 *
 * No `wpcom-local-dev://` retry either: only Studio builds before 1.6.4 registered that scheme, and
 * for every later build the retry is a second navigation, without a user gesture, to a scheme
 * nothing handles.
 */
export function openStudioSyncConnect( params: StudioSyncConnectParams ): void {
	window.location.href = buildStudioSyncConnectUrl( params );
}
