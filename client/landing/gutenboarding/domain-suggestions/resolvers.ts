/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveDomainSuggestions } from './actions';

export function* getDomainSuggestions( queryObject ) {
	const url = 'https://public-api.wordpress.com/wpcom/v1.1/domains/sugestions';

	// @FIXME use generic fetch?
	const verticals = yield apiFetch( { url: addQueryArgs( url, queryObject ) } );

	return receiveDomainSuggestions( verticals );
}
