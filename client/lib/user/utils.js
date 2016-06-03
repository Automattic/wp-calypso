/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:user:utilities' ),
	config = require( 'config' );

/**
 * Internal dependencies
 */
var user = require( 'lib/user' )();

const VERIFICATION_POLL_INTERVAL = 15000;

var userUtils = {
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
		var logoutUrl = userUtils.getLogoutUrl( redirect );

		// Clear any data stored locally within the user data module or localStorage
		user.clear();
		debug( 'User stored data cleared' );

		// Forward user to WordPress.com to be logged out
		location.href = logoutUrl;
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

	pollVerificationForSite: function( site ) {
		return new Promise( ( resolve, reject ) => {
			let serverPoll;
			let check = ( signal ) => {
				// skip server poll if page is in the background
				// and this was not triggered by a signal
				if ( document.hidden && !signal ) {
					return;
				}

				user.once( 'change', () => {
					if ( !this.needsVerificationForSite( site ) ) {
						// email verification took place
						resolve( user );
						clearInterval( serverPoll );
					}
				} );

				user.fetch();
			};

			serverPoll = setInterval( check, VERIFICATION_POLL_INTERVAL );

			// wait for localStorage event (from other windows)
			window.addEventListener( 'storage', ( e ) => {
				if ( e.key === '__email_verified_signal__' && e.newValue ) {
					window.localStorage.removeItem( '__email_verified_signal__' );
					check( true );
				}
			} );
		} );
	},

	signalVerification: function() {
		if ( window.localStorage ) {
			// use localStorage to signal to other browser windows that the user's email was verified
			window.localStorage.setItem( '__email_verified_signal__', 1 );
		}
	},
};

module.exports = userUtils;
