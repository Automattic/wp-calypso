/**
 * External Dependencies
 */
const { ipcMain: ipc } = require( 'electron' );
const https = require( 'https' ); // eslint-disable-line import/no-nodejs-modules
const url = require( 'url' );
const events = require( 'events' );

/**
 * Module variables
 */
const noop = function () {};

function authorize( username, token ) {
	const responder = new events.EventEmitter();
	const body = 'log=' + username;
	const options = url.parse( 'https://wordpress.com/wp-login.php' );

	responder.username = username;

	options.method = 'POST';
	options.headers = {
		Authorization: 'Bearer ' + token,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': body.length,
	};

	const req = https.request( options, function ( res ) {
		let responseBody = '';

		responder.emit( 'response', res );

		res.on( 'data', function ( data ) {
			responseBody += data;
		} );

		res.on( 'end', function () {
			responder.emit( 'body', responseBody );
		} );
	} );
	req.end( body );
	return responder;
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

function setSessionCookies( window, onComplete ) {
	return function ( response ) {
		let cookieHeaders = response.headers[ 'set-cookie' ];
		let count = 0;
		if ( ! Array.isArray( cookieHeaders ) ) {
			cookieHeaders = [ cookieHeaders ];
		}

		count = cookieHeaders.length;

		cookieHeaders.map( parseCookie ).forEach( function ( cookie ) {
			cookie.url = 'https://wordpress.com/';
			if ( cookie.httponly ) {
				cookie.session = true;
			}
			window.webContents.session.cookies.set( cookie, function () {
				count--;
				if ( count === 0 ) {
					if ( onComplete ) onComplete();
				}
			} );
		} );
	};
}

function auth( window, onAuthorized ) {
	let currentRequest;

	ipc.on( 'user-auth', function ( event, user, token ) {
		if ( user && user.data ) {
			const userData = user.data;
			if ( currentRequest && currentRequest.username === userData.username ) {
				// already authing
				return;
			}
			currentRequest = authorize( userData.username, token ).on(
				'response',
				setSessionCookies( window, onAuthorized )
			);
		} else {
			// retrieve all cookies
			window.webContents.session.cookies.get( {}, function ( e, cookies ) {
				if ( e ) {
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
