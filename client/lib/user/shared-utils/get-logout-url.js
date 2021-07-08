/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

export function getLogoutUrl( userData, redirect ) {
	let url;
	let subdomain = '';

	// If logout_URL isn't set, then go ahead and return the logout URL
	// without a proper nonce as a fallback.
	// Note: we never want to use logout_URL in the desktop app
	if ( ! userData?.logout_URL || config.isEnabled( 'always_use_logout_url' ) ) {
		// Use localized version of the homepage in the redirect
		if ( userData?.localeSlug && userData.localeSlug !== '' && userData.localeSlug !== 'en' ) {
			subdomain = userData.localeSlug + '.';
		}

		url = config( 'logout_url' ).replace( '|subdomain|', subdomain );
	} else {
		url = userData.logout_URL;
	}

	if ( 'string' === typeof redirect ) {
		redirect = '&redirect_to=' + encodeURIComponent( redirect );
		url += redirect;
	}

	return url;
}
