/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveVerticals } from './actions';

export function* getVerticals() {
	const url = 'https://public-api.wordpress.com/wpcom/v2/verticals';

	// @FIXME use generic fetch?
	const verticals = yield apiFetch( { url } );

	return receiveVerticals( verticals );
}
