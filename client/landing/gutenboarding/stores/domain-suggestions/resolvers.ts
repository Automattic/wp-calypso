/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveDomainSuggestions } from './actions';

export function* __internalGetDomainSuggestions(
	// Resolver has the same signature as corresponding selector without the initial state argument
	queryObject: Parameters< typeof import('./selectors').__internalGetDomainSuggestions >[ 1 ]
) {
	const url = 'https://public-api.wordpress.com/rest/v1.1/domains/suggestions';

	// `credentials` and `mode` args are needed since we're accessing the WP.com REST API
	// (rather than the WP Core REST API)
	const suggestions = yield apiFetch( {
		credentials: 'same-origin',
		mode: 'cors',
		url: addQueryArgs( url, queryObject ),
	} );

	return receiveDomainSuggestions( queryObject, suggestions );
}
