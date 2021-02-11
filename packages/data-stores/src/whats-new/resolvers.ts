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
 * Fetch list of active What's New announcements.
 *
 * At this time no validation or normalization is happening on the
 * API response.
 */
export function* getWhatsNewList() {
	try {
		const list = yield wpcomRequest( {
			path: 'whats-new/list',
			apiVersion: '2',
		} );
		yield dispatch( STORE_KEY ).receiveWhatsNewList( list );
	} catch ( e ) {}
}
