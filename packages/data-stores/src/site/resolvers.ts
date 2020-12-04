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
	yield dispatch( STORE_KEY ).fetchSite();
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

/**
 * Get all site domains
 *
 * @param siteId {number} The site id
 */
export function* getSiteDomains( siteId: number ) {
	try {
		const result = yield wpcomRequest( {
			path: '/sites/' + encodeURIComponent( siteId ) + '/domains',
			apiVersion: '1.2',
		} );
		yield dispatch( STORE_KEY ).receiveSiteDomains( siteId, result?.domains );
	} catch ( e ) {}
}
