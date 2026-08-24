import config from '@automattic/calypso-config';
import bodyParser from 'body-parser';
import qs from 'qs';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';

const ALLOWED_ORIGINS = [ 'https://my.wordpress.com' ];

const RELATIVE_URL_BASES = [ 'https://relative-url-a.invalid', 'https://relative-url-b.invalid' ];

/**
 * Only origins from `ALLOWED_ORIGINS` or relative URLs are allowed.
 * For completeness, we need two placeholder base URLs to check for relative URL-ness.
 * It prevents us from incorrectly allowing a URL that actually did use `relative-url.invalid`.
 */
export function isAllowedRedirectUrl( url ) {
	let parsed;
	try {
		parsed = RELATIVE_URL_BASES.map( ( base ) => new URL( url, base ) );
	} catch {
		return false;
	}

	if ( ALLOWED_ORIGINS.includes( parsed[ 0 ].origin ) ) {
		return true;
	}

	return url.startsWith( '/' ) && parsed.every( ( p, i ) => p.origin === RELATIVE_URL_BASES[ i ] );
}

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
		wpcom.req
			.post( '/users/social/new', {
				...loginEndpointData(),
				...request.user_openid_data,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
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

	const state = JSON.parse( request.body.state );
	const originalUrlPath = state.originalUrlPath ?? request.originalUrl.split( '#' )[ 0 ];
	const hashString = qs.stringify( {
		...request.user_openid_data,
		client_id: config( 'apple_oauth_client_id' ),
		state: state.oauth2State,
	} );

	if ( ! isAllowedRedirectUrl( originalUrlPath ) ) {
		return next();
	}

	response.redirect( originalUrlPath + '?' + state.queryString + '#' + hashString );
}

export default function ( app ) {
	return app.post(
		[ '/log-in/apple/callback', '/start/user', '/me/security/social-login' ],
		bodyParser.urlencoded( { extended: true } ),
		loginWithApple,
		redirectToCalypso
	);
}
