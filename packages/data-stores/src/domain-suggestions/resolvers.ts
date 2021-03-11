/**
 * External dependencies
 */
import { stringify } from 'qs';
import { translate } from 'i18n-calypso';
import { isFQDN } from 'validator';

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
import { getFormattedPrice } from './utils';

import type { DomainSuggestion, DomainSuggestionQuery } from './types';

function getAvailabilityURL( domainName: string ) {
	return `https://public-api.wordpress.com/rest/v1.3/domains/${ encodeURIComponent(
		domainName
	) }/is-available?is_cart_pre_check=true`;
}

export const isAvailable = function* isAvailable(
	domainName: TailParameters< Selectors[ 'isAvailable' ] >[ 0 ]
) {
	const url = getAvailabilityURL( domainName );

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

export function* __internalGetDomainSuggestions( queryObject: DomainSuggestionQuery ) {
	// If normalized search string (`query`) contains no alphanumerics, endpoint 404s
	if ( ! queryObject.query ) {
		return receiveDomainSuggestionsError( 'Empty query' );
	}

	yield fetchDomainSuggestions();

	let suggestions: DomainSuggestion[];

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

	if ( ! suggestions ) {
		// Other internal server errors
		return receiveDomainSuggestionsError(
			translate( 'Invalid response from the server' ) as string
		);
	}

	// if the query is a FQDN and the results don't have it,
	// this implies that the user is searching for an unavailable domain name
	// TODO: query the availability endpoint to find the exact reason why it's unavailable
	// all the possible responses can be found here https://github.com/Automattic/wp-calypso/blob/trunk/client/lib/domains/registration/availability-messages.js#L40-L390
	if (
		isFQDN( queryObject.query ) &&
		suggestions &&
		! suggestions.some( ( s ) => s.domain_name.toLowerCase() === queryObject.query )
	) {
		const unavailableSuggestion: DomainSuggestion = {
			domain_name: queryObject.query,
			unavailable: true,
			cost: '',
			raw_price: 0,
			currency_code: '',
		};
		suggestions.unshift( unavailableSuggestion );
	}

	const processedSuggestions = suggestions.map( ( suggestion: DomainSuggestion ) => {
		if ( suggestion.unavailable ) {
			return suggestion;
		}
		return {
			...suggestion,
			...( suggestion.raw_price &&
				suggestion.currency_code && {
					cost: getFormattedPrice( suggestion.raw_price, suggestion.currency_code ),
				} ),
		};
	} );

	return receiveDomainSuggestionsSuccess( queryObject, processedSuggestions );
}
