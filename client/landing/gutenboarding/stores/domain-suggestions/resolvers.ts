/**
 * External dependencies
 */
import { addQueryArgs, InputArgsObject } from '@wordpress/url';
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

	// If normalized search string (`query`) contains no alphanumerics, endpoint 404s
	if ( ! queryObject.query ) {
		return receiveDomainSuggestions( queryObject, [] );
	}

	// `credentials` and `mode` args are needed since we're accessing the WP.com REST API
	// (rather than the WP Core REST API)
	const suggestions = yield apiFetch( {
		credentials: 'same-origin',
		mode: 'cors',
		// Cast so we can use our closed interface without an index type.
		// It's likely the type definitions could be improved upstream to allow this:
		// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/dd4b4bf26c3bf43ea2df913efe70a427969f3731/types/wordpress__url/index.d.ts#L7-L54
		url: addQueryArgs( url, ( queryObject as unknown ) as InputArgsObject ),
	} );

	return receiveDomainSuggestions( queryObject, suggestions );
}
