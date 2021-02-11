/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveWhatsNewList } from './actions';

/**
 * Fetch list of active What's New announcements.
 *
 * At this time no validation or normalization is happening on the
 * API response.
 */
export function* getWhatsNewList() {
	const url = 'https://public-api.wordpress.com/wpcom/v2/whats-new/list';
	const list = yield apiFetch( { url } );

	return receiveWhatsNewList( list );
}
