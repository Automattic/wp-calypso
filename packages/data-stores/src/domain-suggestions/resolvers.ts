/**
 * External dependencies
 */
import { stringify } from 'qs';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	receiveCategories,
	receiveDomainSuggestionsSuccess,
	receiveDomainSuggestionsError,
	fetchDomainSuggestions,
	receiveDomainAvailability,
} from './actions';
import { fetchAndParse, wpcomRequest } from '../wpcom-request-controls';
import type { Selectors } from './selectors';
import type { TailParameters } from '../mapped-types';

export const isAvailable = function* isAvailable(
	domainName: TailParameters< Selectors[ 'isAvailable' ] >[ 0 ]
) {
	const url = `https://public-api.wordpress.com/rest/v1.3/domains/${ encodeURIComponent(
		domainName
	) }/is-available?is_cart_pre_check=true`;

	try {
		const { body } = yield fetchAndParse( url );
		return receiveDomainAvailability( domainName, body );
	} catch {
		// the API returns a status of 'unknown' if it can not accurately determine
		// availability, we will return the same status if the API request fails.
		return receiveDomainAvailability( domainName, {
			domain_name: domainName,
			mappable: 'unknown',
			status: 'unknown',
			supports_privacy: false,
		} );
	}
};

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
		return receiveDomainSuggestionsError( 'Empty query' );
	}

	yield fetchDomainSuggestions();

	let suggestions;
	try {
		suggestions = yield wpcomRequest( {
			apiVersion: '1.1',
			path: '/domains/suggestions',
			query: stringify( queryObject ),
		} );
	} catch ( e ) {
		// e.g. no connection, or JSON parsing error
		return receiveDomainSuggestionsError(
			e.message || ( translate( 'Error while fetching server response' ) as string )
		);
	}

	if ( ! suggestions || suggestions === '' ) {
		// Other internal server errors
		return receiveDomainSuggestionsError(
			translate( 'Invalid response from the server' ) as string
		);
	}

	return receiveDomainSuggestionsSuccess( queryObject, suggestions );
}
