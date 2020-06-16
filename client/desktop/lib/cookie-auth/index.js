'use strict';

/* eslint no-multi-spaces: [2, { exceptions: { "VariableDeclarator": true } }] */

/**
 * External Dependencies
 */
const ipc = require( 'electron' ).ipcMain;
const https = require( 'https' );
const url = require( 'url' );
const events = require( 'events' );

/**
 * Module variables
 */
const noop = function() {};

function authorize( username, token ) {
	var responder = new events.EventEmitter();
	var body = 'log=' + username;
	var options = url.parse( 'https://wordpress.com/wp-login.php' );
	var req;

	responder.username = username;

	options.method = 'POST';
	options.headers = {
		Authorization: 'Bearer ' + token,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': body.length
	};

	req = https.request( options, function( res ) {
		var responseBody = '';

		responder.emit( 'response', res );

		res.on( 'data', function( data ) {
			responseBody += data;
		} );

		res.on( 'end', function() {
			responder.emit( 'body', responseBody );
		} );
	} );
	req.end( body );
	return responder;
}

function parseCookie( cookieStr ) {
	var cookie = {};
	// split, the first is key/value, the rest are settings
	var parts = cookieStr.split( '; ' ).map( function( v ) {
		return v.split( '=' );
	} );
	var value;

	if ( parts.length === 0 ) {
		return cookie;
	}

	value = parts.shift();

	if ( value.length === 2 ) {
		cookie.name = value[0];
		cookie.value = value[1];
	} else {
		parts.unshift( value );
	}

	return parts.reduce( function( collect, pair ) {
		var val = true;
		if ( pair.length === 2 ) {
			val = pair[1];
		}
		collect[pair[0]] = val;
		return cookie;
	}, cookie );
}

function setSessionCookies( window, onComplete ) {
	return function( response ) {
		var cookieHeaders = response.headers['set-cookie'];
		var count = 0;
		if ( !Array.isArray( cookieHeaders ) ) {
			cookieHeaders = [cookieHeaders];
		}

		count = cookieHeaders.length;

		cookieHeaders.map( parseCookie ).forEach( function( cookie ) {
			cookie.url = 'https://wordpress.com/'
			if ( cookie.httponly ) {
				cookie.session = true;
			}
			window.webContents.session.cookies.set( cookie, function() {
				count --;
				if ( count === 0 ) {
					if ( onComplete ) onComplete();
				}
			} );
		} );
	};
}

function auth( window, onAuthorized ) {
	var userData, currentRequest;

	ipc.on( 'user-auth', function( event, user, token ) {
		if ( user && user.data ) {
			userData = user.data;
			if ( currentRequest && currentRequest.username === userData.username ) {
				// already authing
				return;
			}
			currentRequest = authorize( userData.username, token ).on( 'response', setSessionCookies( window, onAuthorized ) );
		} else {
			// retrieve all cookies
			window.webContents.session.cookies.get( {}, function( e, cookies ) {
				if ( e ) {
					return;
				}

				cookies.forEach( function( cookie ) {
					var domain = cookie.domain;
					var cookieUrl = 'https://' + ( domain.indexOf( '.' ) === 0 ? domain.slice( 1 ) : domain ) + cookie.path;

					window.webContents.session.cookies.remove( cookieUrl, cookie.name, noop );
				} );
			} );
		}
	} );

	return window;
}

module.exports = auth;
