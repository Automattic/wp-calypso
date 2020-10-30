/**
 * External Dependencies
 */
const { ipcMain: ipc } = require( 'electron' );
const https = require( 'https' ); // eslint-disable-line import/no-nodejs-modules
const url = require( 'url' );

/**
 * Internal Dependencies
 */
const log = require( 'calypso/desktop/lib/logger' )( 'cookie-auth' );

/**
 * Module variables
 */
const noop = function () {};

function authorize( username, token ) {
	const body = 'log=' + username;
	const params = url.parse( 'https://wordpress.com/wp-login.php' );
	params.method = 'POST';
	params.headers = {
		Authorization: 'Bearer ' + token,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': body.length,
	};

	return new Promise( ( resolve, reject ) => {
		const req = https.request( params, ( res ) => {
			if ( res.statusCode < 200 ) {
				return reject( new Error( `Status Code: ${ res.statusCode }` ) );
			}
			return resolve( res );
		} );

		req.on( 'error', reject );

		req.end( body );
	} );
}

function parseCookie( cookieStr ) {
	const cookie = {};
	// split, the first is key/value, the rest are settings
	const parts = cookieStr.split( '; ' ).map( ( v ) => v.split( '=' ) );

	if ( parts.length === 0 ) {
		return cookie;
	}

	const value = parts.shift();

	if ( value.length === 2 ) {
		cookie.name = value[ 0 ];
		cookie.value = value[ 1 ];
	} else {
		parts.unshift( value );
	}

	return parts.reduce( function ( collect, pair ) {
		let val = true;
		if ( pair.length === 2 ) {
			val = pair[ 1 ];
		}
		collect[ pair[ 0 ] ] = val;
		return collect;
	}, cookie );
}

function setSessionCookies( window, authorizeResponse ) {
	return new Promise( ( resolve ) => {
		let cookieHeaders = authorizeResponse.headers[ 'set-cookie' ];
		let count = 0;
		if ( ! Array.isArray( cookieHeaders ) ) {
			cookieHeaders = [ cookieHeaders ];
		}

		count = cookieHeaders.length;

		if ( count === 0 ) {
			return resolve( true );
		}

		cookieHeaders.forEach( async function ( cookieStr ) {
			const cookie = parseCookie( cookieStr );
			cookie.url = 'https://wordpress.com/';
			if ( cookie.HttpOnly || cookie.httpOnly || cookie.httponly ) {
				cookie.session = true;
			}
			try {
				await window.webContents.session.cookies.set( cookie );
			} catch ( e ) {
				const { value, ...logCookie } = cookie; // don't log sensitive "value" field
				log.error( `Failed to set session cookie (${ e.message }): `, logCookie );
			}
			count--;
			if ( count === 0 ) {
				return resolve( true );
			}
		} );
	} );
}

function auth( window, onAuthorized ) {
	ipc.on( 'user-auth', async function ( _, user, token ) {
		log.info( `Handling 'user-auth' IPC event, setting session cookies...` );

		if ( user && user.data ) {
			const userData = user.data;

			try {
				const response = await authorize( userData.username, token );
				await setSessionCookies( window, response );
				onAuthorized();

				log.info( 'Session cookies set.' );
			} catch ( e ) {
				log.error( 'Failed to set session cookies: ', e );
			}
		} else {
			log.info( 'No user data, clearing session cookies...' );

			window.webContents.session.cookies.get( {}, function ( e, cookies ) {
				if ( e ) {
					log.error( 'Failed to clear session cookies: ', e );
					return;
				}

				cookies.forEach( function ( cookie ) {
					const domain = cookie.domain;
					const cookieUrl =
						'https://' + ( domain.startsWith( '.' ) ? domain.slice( 1 ) : domain ) + cookie.path;

					window.webContents.session.cookies.remove( cookieUrl, cookie.name, noop );
				} );
			} );
		}
	} );

	return window;
}

module.exports = auth;
