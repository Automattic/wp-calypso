/**
 * External dependencies
 */
import { stringify } from 'qs';
import superagent from 'superagent';
import debugFactory from 'debug';
import crypto from 'crypto';

/**
 * Internal dependencies
 */
import { filterUserObject } from 'calypso/lib/user/shared-utils';
import { getActiveTestNames } from 'calypso/lib/abtest/utility';
import config from 'calypso/config';

const debug = debugFactory( 'calypso:bootstrap' ),
	AUTH_COOKIE_NAME = 'wordpress_logged_in',
	SUPPORT_SESSION_COOKIE_NAME = 'support_session_id',
	/**
	 * WordPress.com REST API /me endpoint.
	 */
	API_PATH = 'https://public-api.wordpress.com/rest/v1/me',
	apiQuery = {
		meta: 'flags',
		abtests: getActiveTestNames( { appendDatestamp: true, asCSV: true } ),
	},
	url = `${ API_PATH }?${ stringify( apiQuery ) }`;

const getApiKey = () => config( 'wpcom_calypso_rest_api_key' );
const getSupportSessionApiKey = () => config( 'wpcom_calypso_support_session_rest_api_key' );

/**
 * Requests the current user for user bootstrap.
 *
 * @param {object} request An Express request.
 * @returns {Promise<object>} A promise for a user object.
 */
export default async function getBootstrappedUser( request ) {
	const authCookieValue = request.cookies[ AUTH_COOKIE_NAME ];
	const geoCountry = request.get( 'x-geoip-country-code' ) || '';
	const supportSessionHeader = request.get( 'x-support-session' );
	const supportSessionCookie = request.cookies[ SUPPORT_SESSION_COOKIE_NAME ];

	if ( ! authCookieValue ) {
		throw new Error( 'Cannot bootstrap without an auth cookie' );
	}

	if ( supportSessionHeader && supportSessionCookie ) {
		// We don't expect to see a support session header and cookie at the same time.
		// They are separate support session auth options.
		throw new Error(
			'Cannot bootstrap with both a support session header and support session cookie.'
		);
	}

	const decodedAuthCookieValue = decodeURIComponent( authCookieValue );

	// create HTTP Request object
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
				'Unable to boostrap user because of invalid SUPPORT SESSION API key in secrets.json'
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
			throw new Error( 'Unable to boostrap user because of invalid API key in secrets.json' );
		}

		const hmac = crypto.createHmac( 'md5', apiKey );
		hmac.update( decodedAuthCookieValue );
		const hash = hmac.digest( 'hex' );

		req.set( 'Authorization', 'X-WPCALYPSO ' + hash );
	}

	// start the request
	try {
		const res = await req;
		debug( '%o -> %o status code', url, res.status );
		return {
			...filterUserObject( res.body ),
			bootstrapped: true,
		};
	} catch ( err ) {
		if ( ! err.response ) {
			throw err;
		}

		const { body, status } = err.response;
		debug( '%o -> %o status code', url, status );
		const error = new Error();
		error.statusCode = status;
		for ( const key in body ) {
			error[ key ] = body[ key ];
		}

		throw error;
	}
}
