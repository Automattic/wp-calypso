import { type TrackingPrefs, isCountryInGdprZone } from '@automattic/calypso-analytics';
import { isE2ETest } from 'calypso/lib/e2e';
import { isWpMobileApp, isWcMobileApp } from 'calypso/lib/mobile-app';
import { isMobileAppRedirectUri } from 'calypso/lib/oauth2-clients';

const isServer = typeof document === 'undefined';

/**
 * Returns a boolean indicating whether a GDPR banner should be shown.
 *
 * Defaults to `false` if the country code is unknown.
 * @param countryCode Country code determined either from cookie or from a special header
 * @param trackingPrefs Parsed object based on `sensitive_pixel_options` (v2) cookie structure
 * @param redirectUri OAuth2 redirect_uri from the login query. Lets the SSR path detect the mobile
 * app webview, where `isWpMobileApp()` can't read the URL (there is no `window` on the server).
 * @returns Whether the current user could be in the GDPR zone. When the `countryCode` are
 * `undefined`, we return `null` which has a meaning of "result unknown".
 */
export default function shouldSeeCookieBanner(
	countryCode?: string,
	trackingPrefs?: TrackingPrefs,
	redirectUri?: string | null
): boolean {
	// the banner is not shown for pages embedded as web view inside the mobile app or during e2e tests
	if (
		isWpMobileApp() ||
		isWcMobileApp() ||
		isMobileAppRedirectUri( redirectUri ) ||
		( ! isServer && isE2ETest() )
	) {
		return false;
	}

	// the request for consent has already been answered, we no longer need to ask
	if ( trackingPrefs?.ok ) {
		return false;
	}

	// if we had issues fetching geo cookies (`countryCode`), fail safe and show the banner
	if ( countryCode === undefined ) {
		return true;
	}

	return isCountryInGdprZone( countryCode );
}
