/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { receiveDomainSuggestions } from './actions';
import { wpcomRequest } from '../wpcom-request-controls';

export function* __internalGetDomainSuggestions(
	// Resolver has the same signature as corresponding selector without the initial state argument
	queryObject: Parameters< typeof import('./selectors').__internalGetDomainSuggestions >[ 1 ]
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
