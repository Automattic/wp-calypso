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
module.exports = function( request ) {
	const authCookieValue = request.cookies.wordpress_logged_in;
	const geoCountry = request.get( 'x-geoip-country-code' ) || '';
	const supportSession = request.get( 'x-support-session' );

	return new Promise( ( resolve, reject ) => {
		if ( authCookieValue && supportSession ) {
			reject(
				new Error(
					'Both an auth cookie and a support session were provided for bootstrap. This should not occur.'
				)
			);
			return;
		}
		if ( ! authCookieValue && ! supportSession ) {
			reject( new Error( 'Cannot bootstrap without an auth cookie or a support session.' ) );
			return;
		}

		// create HTTP Request object
		const req = superagent.get( url );
		req.set( 'User-Agent', 'WordPress.com Calypso' );
		req.set( 'X-Forwarded-GeoIP-Country-Code', geoCountry );

		if ( authCookieValue ) {
			const decodedAuthCookieValue = decodeURIComponent( authCookieValue );

			if ( typeof API_KEY !== 'string' ) {
				return reject(
					new Error( 'Unable to boostrap user because of invalid API key in secrets.json' )
				);
			}

			const hmac = crypto.createHmac( 'md5', API_KEY );
			hmac.update( decodedAuthCookieValue );
			const hash = hmac.digest( 'hex' );

			req.set( 'Authorization', 'X-WPCALYPSO ' + hash );
			req.set( 'Cookie', AUTH_COOKIE_NAME + '=' + decodedAuthCookieValue );
		} else if ( supportSession ) {
			if ( typeof SUPPORT_SESSION_API_KEY !== 'string' ) {
				reject(
					new Error(
						'Unable to boostrap user because of invalid SUPPORT SESSION API key in secrets.json'
					)
				);
				return;
			}

			const hmac = crypto.createHmac( 'md5', SUPPORT_SESSION_API_KEY );
			hmac.update( supportSession );
			const hash = hmac.digest( 'hex' );
			req.set( 'Authorization', `X-WPCALYPSO-SUPPORT-SESSION ${ hash }` );

			req.set( 'x-support-session', supportSession );
		}

		// start the request
		req.end( function( err, res ) {
			let error, key;

			if ( err && ! res ) {
				return reject( err );
			}

			const body = res.body;
			const statusCode = res.status;

			debug( '%o -> %o status code', url, statusCode );

			if ( err ) {
				error = new Error();
				error.statusCode = statusCode;
				for ( key in body ) {
					error[ key ] = body[ key ];
				}

				return reject( error );
			}

			const user = filterUserObject( body );

			resolve( user );
		} );
	} );
};
