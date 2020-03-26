/**
 * External dependencies
 */
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { wpcomRequest } from '../wpcom-request-controls';
import { STORE_KEY } from './constants';

/**
 * Attempt to find an existing site based on its domain, and if not return undefined.
 * We are currently ignoring error messages and silently failing if we can't find an
 * existing site. This could be extended in the future by retrieving the `error` and
 * `message` strings returned by the API.
 *
 * @param slug {string}	The domain to search for
 */
export function* getSite( slug: string ) {
	try {
		const existingSite = yield wpcomRequest( {
			path: '/sites/' + encodeURIComponent( slug ),
			apiVersion: '1.1',
		} );
		yield dispatch( STORE_KEY ).receiveExistingSite( slug, existingSite );
	} catch ( err ) {
		yield dispatch( STORE_KEY ).receiveExistingSiteFailed( slug, undefined );
	}
}
