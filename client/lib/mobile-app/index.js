import { getQueryArgs } from '@wordpress/url';
import { getOAuth2RedirectUri, isMobileAppRedirectUri } from 'calypso/lib/oauth2-clients';

/**
 * Returns whether the user is in a first-party mobile app (WordPress or Jetpack) — either the
 * user agent carries the app token, or the page is the app's OAuth login webview, identified by
 * a `jetpack://` / `wordpress://` redirect_uri. The login webview runs in a system auth session
 * whose user agent carries no `wp-iphone`/`wp-android` token, so the scheme is the only signal.
 * @returns {boolean}
 */
export function isWpMobileApp() {
	if ( typeof navigator === 'undefined' ) {
		return false;
	}
	if ( navigator.userAgent && /wp-(android|iphone)/.test( navigator.userAgent ) ) {
		return true;
	}
	if ( typeof window === 'undefined' ) {
		return false;
	}
	return isMobileAppRedirectUri( getOAuth2RedirectUri( getQueryArgs( window.location.href ) ) );
}

/**
 * Returns whether user is using a WooCommerce mobile app.
 * @returns {boolean} Whether the user agent matches the ones used on the WooCommerce mobile apps.
 */
export function isWcMobileApp() {
	if ( typeof navigator === 'undefined' ) {
		return false;
	}
	return navigator.userAgent && /wc-(android|ios)/.test( navigator.userAgent );
}

const deviceUnknown = {
	device: 'unknown',
	version: 'unknown',
};

export function getMobileDeviceInfo() {
	try {
		const userAgent = navigator.userAgent.toLowerCase();
		const regex = /w[pc]-(android|iphone|ios)\/(\d+(.[0-9a-z-]+)*)/;
		const match = userAgent.match( regex );

		if ( ! match ) {
			return deviceUnknown;
		}

		return {
			device: match[ 1 ],
			version: match[ 2 ],
		};
	} catch ( e ) {
		return deviceUnknown;
	}
}
