import crypto from 'crypto';
import config from '@automattic/calypso-config';
import { type Request } from 'express';
import superagent from 'superagent';

const AUTH_COOKIE_NAME = 'wordpress_logged_in';
const SUPPORT_SESSION_COOKIE_NAME = 'support_session_id';

const getApiKey = () => config( 'wpcom_calypso_rest_api_key' );
const getSupportSessionApiKey = () => config( 'wpcom_calypso_support_session_rest_api_key' );

/**
 * Builds an authenticated superagent GET request to the WordPress.com REST API.
 * Handles auth cookies, HMAC signing, GeoIP, and support session headers.
 */
export function createAuthenticatedRequest( request: Request, url: string ) {
	const authCookieValue = request.cookies[ AUTH_COOKIE_NAME ];
	const geoCountry = request.get( 'x-geoip-country-code' ) || '';
	const supportSessionHeader = request.get( 'x-support-session' );
	const supportSessionCookie = request.cookies[ SUPPORT_SESSION_COOKIE_NAME ];

	if ( ! authCookieValue ) {
		throw new Error( 'Cannot bootstrap without an auth cookie' );
	}

	if ( supportSessionHeader && supportSessionCookie ) {
		throw new Error(
			'Cannot bootstrap with both a support session header and support session cookie.'
		);
	}

	const decodedAuthCookieValue = decodeURIComponent( authCookieValue );

	const req = superagent.get( url );
	req.set( 'User-Agent', 'WordPress.com Calypso' );
	req.set( 'X-Forwarded-GeoIP-Country-Code', geoCountry );

	const cookies = [ `${ AUTH_COOKIE_NAME }=${ decodedAuthCookieValue }` ];
	if ( supportSessionCookie ) {
		cookies.push( `${ SUPPORT_SESSION_COOKIE_NAME }=${ supportSessionCookie }` );
	}
	req.set( 'Cookie', cookies.join( '; ' ) );

	if ( supportSessionHeader ) {
		const supportSessionApiKey = getSupportSessionApiKey();
		if ( typeof supportSessionApiKey !== 'string' ) {
			throw new Error(
				'Unable to bootstrap because of invalid SUPPORT SESSION API key in secrets.json'
			);
		}

		const hmac = crypto.createHmac( 'md5', supportSessionApiKey );
		hmac.update( supportSessionHeader );
		const hash = hmac.digest( 'hex' );

		req.set( 'Authorization', `X-WPCALYPSO-SUPPORT-SESSION ${ hash }` );
		req.set( 'x-support-session', supportSessionHeader );
	} else {
		const apiKey = getApiKey();

		if ( typeof apiKey !== 'string' ) {
			throw new Error( 'Unable to bootstrap because of invalid API key in secrets.json' );
		}

		const hmac = crypto.createHmac( 'md5', apiKey );
		hmac.update( decodedAuthCookieValue );
		const hash = hmac.digest( 'hex' );

		req.set( 'Authorization', 'X-WPCALYPSO ' + hash );
	}

	return req;
}
