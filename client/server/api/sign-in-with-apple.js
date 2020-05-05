/**
 * External dependencies
 */
import bodyParser from 'body-parser';
import qs from 'qs';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';

function loginEndpointData() {
	return {
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		service: 'apple',
		signup_flow_name: 'no-signup',
	};
}

function loginWithApple( request, response, next ) {
	if ( ! request.body.id_token ) {
		return next();
	}

	const idToken = request.body.id_token;
	const user = JSON.parse( request.body.user || '{}' );
	const userEmail = user.email;
	const userName = user.name
		? `${ user.name.firstName || '' } ${ user.name.lastName || '' }`.trim()
		: undefined;

	request.user_openid_data = {
		id_token: idToken,
		user_email: userEmail,
		user_name: userName,
	};

	// An `id_token` is not enough to log a user in (one might have 2FA enabled or an existing account with the same email)
	// Thus we need to return `id_token` to the front-end so it can handle all sign-up/sign-in cases.
	// However Apple sends the user data only once,
	// so let's query our sign-up endpoint with the `signup_flow_name=no-signup` to make sure the user data is saved
	if ( userEmail ) {
		wpcom
			.undocumented()
			.usersSocialNew( {
				...loginEndpointData(),
				...request.user_openid_data,
			} )
			.catch( () => {
				// ignore errors
			} )
			.finally( next );
	} else {
		next();
	}
}

function redirectToCalypso( request, response, next ) {
	if ( ! request.user_openid_data ) {
		return next();
	}

	const originalUrlPath = request.originalUrl.split( '#' )[ 0 ];
	const hashString = qs.stringify( {
		...request.user_openid_data,
		client_id: config( 'apple_oauth_client_id' ),
		state: request.body.state,
	} );

	response.redirect( originalUrlPath + '#' + hashString );
}

module.exports = function ( app ) {
	return app.post(
		[ '/log-in/apple/callback', '/start/user', '/me/security/social-login' ],
		bodyParser.urlencoded(),
		loginWithApple,
		redirectToCalypso
	);
};
