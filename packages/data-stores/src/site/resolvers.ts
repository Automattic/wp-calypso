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
 * Attempt to find a site based on its id, and if not return undefined.
 * We are currently ignoring error messages and silently failing if we can't find a
 * site. This could be extended in the future by retrieving the `error` and
 * `message` strings returned by the API.
 *
 * @param siteId {number}	The site to look up
 */
export function* getSite( siteId: number ) {
	try {
		const existingSite = yield wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ),
			apiVersion: '1.1',
		} );
		yield dispatch( STORE_KEY ).receiveSite( siteId, existingSite );
	} catch ( err ) {
		yield dispatch( STORE_KEY ).receiveSiteFailed( siteId, undefined );
	}
}
