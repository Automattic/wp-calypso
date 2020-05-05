/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveVerticals } from './actions';

/**
 * Fetch verticals from the verticals endpoint.
 *
 * Note: As long as all verticals are fetched (no search provided),
 * the Vertical type used in receiveVerticals should be correct.
 * However, if a search term is provided, the API may provide a
 * different type of vertical representing the search.
 *
 * At this time no validation or normalization is happening on the
 * API response.
 */
export function* getVerticals() {
	const url = 'https://public-api.wordpress.com/wpcom/v2/verticals';
	const verticals = yield apiFetch( { url } );

	// @TODO: validate and normalize verticals?

	return receiveVerticals( verticals );
}
