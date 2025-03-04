const { shell } = require( 'electron' );
const config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:authentication' );
const { isNonDesktopLoginUrl } = require( '../../lib/login' );

module.exports = function ( { view } ) {
	if ( ! config.oauthLoginEnabled ) {
		return;
	}

	view.webContents.on( 'will-navigate', function ( event, url ) {
		// The button in the desktop login page links to /desktop-start-login.
		// We intercept those links here, and start the oauth authentication flow.
		if ( url.includes( '/desktop-start-login' ) ) {
			event.preventDefault();
			startAuthentication();
			return;
		}

		// Intercept attempts to load the normal login page,
		// and instead open the desktop login page.
		if ( isNonDesktopLoginUrl( url ) ) {
			void view.webContents.loadURL( config.loginURL() );
		}
	} );
};

function startAuthentication() {
	const url = new URL( 'https://public-api.wordpress.com/oauth2/authorize' );
	url.searchParams.set( 'response_type', 'token' );
	url.searchParams.set( 'client_id', '41936' );
	url.searchParams.set( 'redirect_uri', `${ config.protocol }://token` );
	url.searchParams.set( 'scope', 'global' );

	log.info( `Opening URL in external browser: '${ url.toString() }'` );
	void shell.openExternal( url.toString() );
}
