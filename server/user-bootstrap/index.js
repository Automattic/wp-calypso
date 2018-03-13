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
	API_PATH = 'https://public-api.wordpress.com/rest/v1/me',
	apiQuery = {
		meta: 'flags',
		abtests: getActiveTestNames( { appendDatestamp: true, asCSV: true } ),
	},
	url = `${ API_PATH }?${ stringify( apiQuery ) }`;

module.exports = function( authCookieValue, geoCountry, callback ) {
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

		req.set( 'X-Forwarded-GeoIP-Country-Code', geoCountry );
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

		user = filterUserObject( body );
		callback( null, user );
	} );
};
