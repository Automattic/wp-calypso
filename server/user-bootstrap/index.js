/** @format */
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
import { filterUserObject } from 'lib/user/shared-utils';
import { getActiveTestNames } from 'lib/abtest/utility';
import config from 'config';

const debug = debugFactory( 'calypso:bootstrap' ),
	API_KEY = config( 'wpcom_calypso_rest_api_key' ),
	AUTH_COOKIE_NAME = 'wordpress_logged_in',
	/**
	 * WordPress.com REST API /me endpoint.
	 */
	SUPPORT_SESSION_API_KEY = config( 'wpcom_calypso_support_session_rest_api_key' ),
	API_PATH = 'https://public-api.wordpress.com/rest/v1/me',
	apiQuery = {
		meta: 'flags',
		abtests: getActiveTestNames( { appendDatestamp: true, asCSV: true } ),
	},
	url = `${ API_PATH }?${ stringify( apiQuery ) }`;

/**
 * Requests the current user for user bootstrap.
 *
 * @param {object} request An Express request.
 *
 * @returns {Promise<object>} A promise for a user object.
 */
module.exports = async function( request ) {
	const authCookieValue = request.cookies[ AUTH_COOKIE_NAME ];
	const geoCountry = request.get( 'x-geoip-country-code' ) || '';
	const supportSession = request.get( 'x-support-session' );

	if ( ! authCookieValue ) {
		throw new Error( 'Cannot bootstrap without an auth cookie' );
	}

	const decodedAuthCookieValue = decodeURIComponent( authCookieValue );

	// create HTTP Request object
	const req = superagent.get( url );
	req.set( 'User-Agent', 'WordPress.com Calypso' );
	req.set( 'X-Forwarded-GeoIP-Country-Code', geoCountry );
	req.set( 'Cookie', AUTH_COOKIE_NAME + '=' + decodedAuthCookieValue );

	if ( supportSession ) {
		if ( typeof SUPPORT_SESSION_API_KEY !== 'string' ) {
			throw new Error(
				'Unable to boostrap user because of invalid SUPPORT SESSION API key in secrets.json'
			);
		}

		const hmac = crypto.createHmac( 'md5', SUPPORT_SESSION_API_KEY );
		hmac.update( supportSession );
		const hash = hmac.digest( 'hex' );

		req.set( 'Authorization', `X-WPCALYPSO-SUPPORT-SESSION ${ hash }` );
		req.set( 'x-support-session', supportSession );
	} else {
		if ( typeof API_KEY !== 'string' ) {
			throw new Error( 'Unable to boostrap user because of invalid API key in secrets.json' );
		}

		const hmac = crypto.createHmac( 'md5', API_KEY );
		hmac.update( decodedAuthCookieValue );
		const hash = hmac.digest( 'hex' );

		req.set( 'Authorization', 'X-WPCALYPSO ' + hash );
	}

	// start the request
	try {
		const res = await req;
		debug( '%o -> %o status code', url, res.status );
		return filterUserObject( res.body );
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
};
