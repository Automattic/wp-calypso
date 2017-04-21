/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import userModule from 'lib/user';
import { addQueryArgs } from 'lib/url';

/**
 * Module Variables
 */
const user = userModule();
const debug = debugModule( 'calypso:user:utilities' );

var userUtils = {
	getLoginUrl: function( redirect ) {
		const url = config( 'login_url' );

		return redirect
			? addQueryArgs( { redirect_to: redirect }, url )
			: url;
	},

	getLogoutUrl: function( redirect ) {
		var url = '/logout',
			userData = user.get(),
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

	logout: function( redirect ) {
		const logoutUrl = userUtils.getLogoutUrl( redirect );

		// Clear any data stored locally within the user data module or localStorage
		user.clear( () => location.href = logoutUrl );
	},

	getLocaleSlug: function() {
		return user.get().localeSlug;
	},

	isLoggedIn: function() {
		return Boolean( user.data );
	},

	needsVerificationForSite: function( site ) {
		// do not allow publish for unverified e-mails,
		// but allow if the site is VIP
		return !user.get().email_verified && !( site && site.is_vip );
	},
};

module.exports = userUtils;
