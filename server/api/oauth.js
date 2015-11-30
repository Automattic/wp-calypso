/**
 * External dependencies
 */
var req = require( 'superagent' ),
	bodyParser = require( 'body-parser' );

 /**
  * Internal dependencies
  */
var config = require( 'config' );

/*
 * Proxies an oauth login request to the WP API
 * We need to do this to get around CORS issues with making the request directly from the Electron browser
 */
function proxyOAuth( request, response ) {
	// We are making a password request, and want all the 2fa checks enabled
	var data = {
		client_id: config( 'desktop_oauth_client_id' ),
		client_secret: config( 'desktop_oauth_client_secret' ),
		grant_type: 'password',
		username: request.body.username,
		password: request.body.password,
		wpcom_supports_2fa: true
	};

	if ( request.body.auth_code ) {
		// Pass along the one-time password
		data.wpcom_otp = request.body.auth_code;
	}

	req.post( config( 'desktop_oauth_token_endpoint' ) )
		.type( 'form' )
		.send( data )
		.end( function( error, res ) {
			if ( typeof res === 'undefined' ) {
				// No connection, return the network error
				response.status( 408 );
				response.json( { error: 'invalid_request', error_description: 'The request to ' + error.host + ' failed (code ' + error.code + '), please check your internet connection and try again.' } );
			} else if ( error ) {
				// Error from the API, just pass back
				response.status( error.status );
				response.json( res.body );
			} else {
				// Return the token as a response
				response.json( res.body );
			}
		} );
}

function logout( request, response ) {
	response.clearCookie( 'wpcom_token' );
	response.redirect( config( 'login_url' ) );
}

module.exports = function( app ) {
	app.use( bodyParser.json() );

	app.post( '/oauth', proxyOAuth );
	app.get( '/logout', logout );
}
