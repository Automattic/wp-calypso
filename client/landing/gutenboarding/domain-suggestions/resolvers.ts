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
	const url = 'https://public-api.wordpress.com/wpcom/v1.1/domains/sugestions';

	// @FIXME use generic fetch?
	const suggestions = yield apiFetch( { url: addQueryArgs( url, queryObject ) } );

	return receiveDomainSuggestions( queryObject, suggestions );
}
