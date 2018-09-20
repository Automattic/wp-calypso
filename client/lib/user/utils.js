/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import userModule from 'lib/user';

/**
 * Module Variables
 */
const user = userModule();
const debug = debugModule( 'calypso:user:utilities' );

const userUtils = {
	getLogoutUrl( redirect ) {
		const userData = user.get();
		let url = '/logout',
			subdomain = '';

		// If logout_URL isn't set, then go ahead and return the logout URL
		// without a proper nonce as a fallback.
		// Note: we never want to use logout_URL in the desktop app
		if ( ! userData.logout_URL || config.isEnabled( 'always_use_logout_url' ) ) {
			// Use localized version of the homepage in the redirect
			if ( userData.localeSlug && userData.localeSlug !== '' && userData.localeSlug !== 'en' ) {
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

		debug( 'Logout Url: ' + url );

		return url;
	},

	logout( redirect ) {
		const logoutUrl = userUtils.getLogoutUrl( redirect );

		// Clear any data stored locally within the user data module or localStorage
		user.clear( () => ( location.href = logoutUrl ) );
	},

	getLocaleSlug() {
		return user.get().localeSlug;
	},

	isLoggedIn() {
		return Boolean( user.data );
	},
};

export default userUtils;
