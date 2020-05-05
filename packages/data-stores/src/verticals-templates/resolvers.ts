/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveTemplates } from './actions';

export function* getTemplates(
	// Resolver has the same signature as corresponding selector without the initial state argument
	verticalId: Parameters< typeof import('./selectors')[ 'getTemplates' ] >[ 1 ]
) {
	const resp = yield apiFetch( {
		url: `https://public-api.wordpress.com/wpcom/v2/verticals/${ verticalId }/templates`,
	} );

	return receiveTemplates( verticalId, resp.templates );
}
