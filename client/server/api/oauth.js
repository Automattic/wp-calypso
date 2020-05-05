/**
 * External dependencies
 */
const req = require( 'superagent' );
const bodyParser = require( 'body-parser' );

/**
 * Internal dependencies
 */
const config = require( 'config' );

function oauth() {
	return {
		client_id: config( 'desktop_oauth_client_id' ),
		client_secret: config( 'desktop_oauth_client_secret' ),
		wpcom_supports_2fa: true,
		grant_type: 'password',
	};
}

/*
 * Proxies an oauth login request to the WP API
 * We need to do this to get around CORS issues with making the request directly from the Electron browser
 */
function proxyOAuth( request, response ) {
	// We are making a password request, and want all the 2fa checks enabled
	const data = Object.assign(
		{},
		{
			username: request.body.username,
			password: request.body.password,
		},
		oauth()
	);

	if ( request.body.auth_code ) {
		// Pass along the one-time password
		data.wpcom_otp = request.body.auth_code;
	}

	req
		.post( config( 'desktop_oauth_token_endpoint' ) )
		.type( 'form' )
		.send( data )
		.end(
			validateOauthResponse( response, function ( error, res ) {
				// Return the token as a response
				response.json( res.body );
			} )
		);
}

function checkConnection( serverResponse, fn ) {
	return function ( error, clientResponse ) {
		if ( typeof clientResponse === 'undefined' ) {
			return serverResponse.status( 408 ).json( {
				error: 'invalid_request',
				error_description:
					'The request to ' +
					error.host +
					' failed (code ' +
					error.code +
					'), please check your internet connection and try again.',
			} );
		}
		fn( error, clientResponse );
	};
}

function proxyError( serverResponse, fn ) {
	return function ( error, clientResponse ) {
		// Error from the API, just pass back
		if ( error ) {
			return serverResponse.status( error.status ).json( clientResponse.body );
		}
		fn( error, clientResponse );
	};
}

function validateOauthResponse( serverResponse, fn ) {
	return checkConnection( serverResponse, proxyError( serverResponse, fn ) );
}

function logout( request, response ) {
	response.clearCookie( 'wpcom_token' );
	response.redirect( config( 'login_url' ) );
}

function sms( request, response ) {
	const data = Object.assign(
		{},
		{
			username: request.body.username,
			password: request.body.password,
			wpcom_resend_otp: true,
		},
		oauth()
	);

	req
		.post( config( 'desktop_oauth_token_endpoint' ) )
		.type( 'form' )
		.send( data )
		.end(
			validateOauthResponse( response, function ( error, res ) {
				response.json( res.body );
			} )
		);
}

module.exports = function ( app ) {
	return app
		.use( bodyParser.json() )
		.post( '/oauth', proxyOAuth )
		.get( '/logout', logout )
		.post( '/sms', sms );
};
