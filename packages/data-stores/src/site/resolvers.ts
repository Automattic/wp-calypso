/**
 * External dependencies
 */
import wpcomRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { receiveExistingSite } from './actions';
import { ExistingSiteResponse } from './types';

/**
 * Attempt to find an existing site based on its domain, and if not return undefined.
 * We are currently ignoring error messages and silently failing if we can't find an
 * existing site. This could be extended in the future by retrieving the `error` and
 * `message` strings returned by the API.
 *
 * @param domain {string}	The domain to search for
 */
export async function getExistingSite( domain: string ) {
	try {
		const existingSite = await wpcomRequest< ExistingSiteResponse >( {
			path: '/sites/' + encodeURIComponent( domain ),
			apiVersion: '1.1',
		} );

		if ( 'error' in existingSite ) {
			return receiveExistingSite( undefined );
		}
		return receiveExistingSite( existingSite );
	} catch ( err ) {
		return receiveExistingSite( undefined );
	}
}
