/**
 * External Dependencies
 */
const EventEmitter = require( 'events' ).EventEmitter;

/**
 * Internal Dependencies
 */
const keychain = require( '../../lib/keychain' );
const log = require( '../../lib/logger' )( 'desktop:session' );

/*
 * Module constants
 */

class SessionManager extends EventEmitter {
	constructor() {
		super();
	}

	async init( window ) {
		log.info( 'Initializing session manager...' );

		this.loggedIn = false;
		this.window = window;

		// Check for existing cookies
		const wordpress_logged_in = await getCookie(
			window,
			'https://public-api.wordpress.com',
			'wordpress_logged_in'
		);
		if ( wordpress_logged_in && ! this.loggedIn ) {
			log.info( `Got 'wordpress_logged_in' cookie, emitting 'logged-in' event...` );

			this.loggedIn = true;
			this.emit( 'logged-in', wordpress_logged_in );
			log.debug( `Logged in with cookie 'wordpress_logged_in': `, wordpress_logged_in );

			await keychainWrite( 'wordpress_logged_in', decodeURIComponent( wordpress_logged_in.value ) );
		}

		const wp_api_sec = await getCookie( window, 'https://public-api.wordpress.com', 'wp_api_sec' );
		if ( this.loggedIn && wp_api_sec ) {
			await keychainWrite( 'wp_api_sec', decodeURIComponent( wp_api_sec.value ) );
			this.emit( 'api:connect' );
		}

		const wp_api = await getCookie( window, null, 'wp_api' );
		// FIXME: For some reason unable to filter this cookie by domain 'https://public-api.wordpress.com'
		if ( this.loggedIn && wp_api ) {
			await keychainWrite( 'wp_api', decodeURIComponent( wp_api.value ) );
		}

		// Listen for auth events
		this.window.webContents.session.cookies.on(
			'changed',
			async ( _, cookie, _reason, removed ) => {
				// Listen for logged in/out events
				if ( cookie.name === 'wordpress_logged_in' && cookie.domain === '.wordpress.com' ) {
					if ( removed && this.loggedIn ) {
						log.info( `'wordpress_logged_in' cookie was removed, emitting 'logged-out' event...` );

						this.loggedIn = false;
						this.emit( 'logged-out' );
						keychain.clear();
					} else {
						log.info( `Got 'wordpress_logged_in' cookie, emitting 'logged-in' event...` );

						this.loggedIn = true;

						this.emit( 'logged-in', { wordpress_logged_in: wordpress_logged_in } );
						log.debug( `Logged in with cookie 'wordpress_logged_in': `, wordpress_logged_in );

						await keychainWrite( 'wordpress_logged_in', decodeURIComponent( cookie.value ) );
					}

					// Listen for wp_api_sec cookie (Pinghub)
					if (
						cookie.name === 'wp_api_sec' &&
						cookie.domain === 'https://public-api.wordpress.com'
					) {
						if ( removed ) {
							this.emit( 'api:disconnect' );
						} else if ( this.loggedIn ) {
							await keychainWrite( 'wp_api_sec', decodeURIComponent( cookie.value ) );
							this.emit( 'api:connect' );
						}
					}

					// Listen for wp_api cookie (Notifications REST API)
					// FIXME: For some reason unable to filter this cookie by domain 'https://public-api.wordpress.com'
					if ( cookie.name === 'wp_api' ) {
						if ( this.loggedIn ) {
							log.info( 'wp_api: ', cookie.value, cookie.domain );
							await keychainWrite( 'wp_api', decodeURIComponent( cookie.value ) );
						}
					}
				}
			}
		);
	}

	isLoggedIn() {
		return this.loggedIn;
	}
}

async function getCookie( window, cookieDomain, cookieName ) {
	let cookies = await window.webContents.session.cookies.get( {
		url: cookieDomain,
		name: cookieName,
	} );
	if ( cookies ) {
		if ( ! Array.isArray( cookies ) ) {
			cookies = [ cookies ];
		}
		return cookies[ 0 ];
	}
	return null;
}

async function keychainWrite( key, value ) {
	let success = false;
	try {
		await keychain.write( key, value );
		success = true;
	} catch ( e ) {
		log.error( 'Failed to write to keychain: ', e );
	}
	return success;
}

module.exports = new SessionManager();
