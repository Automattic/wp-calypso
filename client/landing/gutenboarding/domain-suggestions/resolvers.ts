/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { DomainSuggestionQuery } from './types';
import { receiveDomainSuggestions } from './actions';

export function* getDomainSuggestions( queryObject: DomainSuggestionQuery ) {
	const url = 'https://public-api.wordpress.com/rest/v1.1/domains/suggestions';

	// @FIXME use generic fetch?
	const suggestions = yield apiFetch( {
		credentials: 'same-origin',
		mode: 'cors',
		url: addQueryArgs( url, queryObject ),
	} );

	return receiveDomainSuggestions( queryObject, suggestions );
}
