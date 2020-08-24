/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { receiveCategories, receiveDomainSuggestions } from './actions';
import { fetchAndParse, wpcomRequest } from '../wpcom-request-controls';
import type { Selectors } from './selectors';

export function* getCategories() {
	const categories = yield fetchAndParse(
		'https://public-api.wordpress.com/wpcom/v2/onboarding/domains/categories'
	);
	return receiveCategories( categories.body );
}

export function* __internalGetDomainSuggestions(
	// Resolver has the same signature as corresponding selector without the initial state argument
	queryObject: Parameters< Selectors[ '__internalGetDomainSuggestions' ] >[ 1 ]
) {
	// If normalized search string (`query`) contains no alphanumerics, endpoint 404s
	if ( ! queryObject.query ) {
		return receiveDomainSuggestions( queryObject, [] );
	}

	const suggestions = yield wpcomRequest( {
		apiVersion: '1.1',
		path: '/domains/suggestions',
		query: stringify( queryObject ),
	} );

	return receiveDomainSuggestions( queryObject, suggestions );
}
