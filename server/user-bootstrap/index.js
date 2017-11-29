/** @format */
var superagent = require( 'superagent' ),
	debug = require( 'debug' )( 'calypso:bootstrap' ),
	crypto = require( 'crypto' );

var config = require( 'config' ),
	API_KEY = config( 'wpcom_calypso_rest_api_key' ),
	userUtils = require( './shared-utils' ),
	AUTH_COOKIE_NAME = 'wordpress_logged_in',
	/**
	* WordPress.com REST API /me endpoint.
	*/
	url = 'https://public-api.wordpress.com/rest/v1/me?meta=flags';

module.exports = function( authCookieValue, callback ) {
	// create HTTP Request object
	var req = superagent.get( url ),
		hmac,
		hash;

	if ( authCookieValue ) {
		authCookieValue = decodeURIComponent( authCookieValue );

		if ( typeof API_KEY !== 'string' ) {
			callback( new Error( 'Unable to boostrap user because of invalid API key in secrets.json' ) );
			return;
		}

		hmac = crypto.createHmac( 'md5', API_KEY );
		hmac.update( authCookieValue );
		hash = hmac.digest( 'hex' );

		req.set( 'Authorization', 'X-WPCALYPSO ' + hash );
		req.set( 'Cookie', AUTH_COOKIE_NAME + '=' + authCookieValue );
		req.set( 'User-Agent', 'WordPress.com Calypso' );
	}

	// start the request
	req.end( function( err, res ) {
		var body, statusCode, user, error, key;

		if ( err && ! res ) {
			return callback( err );
		}

		body = res.body;
		statusCode = res.status;

		debug( '%o -> %o status code', url, statusCode );

		if ( err ) {
			error = new Error();
			error.statusCode = statusCode;
			for ( key in body ) {
				error[ key ] = body[ key ];
			}

			return callback( error );
		}

		user = userUtils.filterUserObject( body );
		callback( null, user );
	} );
};
