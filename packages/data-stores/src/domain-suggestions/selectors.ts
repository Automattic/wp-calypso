/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import { DomainSuggestionQuery } from './types';
import { State } from './reducer';
import { stringifyDomainQueryObject } from './utils';

export const getState = ( state: State ) => state;

type DomainSuggestionSelectorOptions = Partial< Exclude< DomainSuggestionQuery, 'query' > >;

export const getDomainSuggestions = (
	_state: State,
	search: string,
	options: DomainSuggestionSelectorOptions = {}
) => {
	const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

	// We need to go through the `select` store to get the resolver action
	return select( STORE_KEY ).__internalGetDomainSuggestions( normalizedQuery );
};

export const isLoadingDomainSuggestions = (
	_state: State,
	search: string,
	options: DomainSuggestionSelectorOptions = {}
) => {
	const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

	return select( 'core/data' ).isResolving( STORE_KEY, '__internalGetDomainSuggestions', [
		normalizedQuery,
	] );
};

/**
 * Do not use this selector. It is for internal use.
 *
 * @private
 *
 * @param state Store state
 * @param queryObject Normalized object representing the query
 * @returns suggestions
 */
export const __internalGetDomainSuggestions = (
	state: State,
	queryObject: DomainSuggestionQuery
) => {
	return state.domainSuggestions[ stringifyDomainQueryObject( queryObject ) ];
};

/**
 * Normalize domain query
 *
 * It's important to have a consistent, reproduceable representation of a domains query so that the result can be
 * stored and retrieved.
 *
 * @see client/state/domains/suggestions/utils.js
 * @see client/components/data/query-domains-suggestions/index.jsx
 *
 * @param search       Domain search string
 * @param queryOptions Optional paramaters for the query
 * @returns Normalized query object
 */
function normalizeDomainSuggestionQuery(
	search: string,
	queryOptions: DomainSuggestionSelectorOptions
): DomainSuggestionQuery {
	return {
		// Defaults
		include_wordpressdotcom: queryOptions.only_wordpressdotcom || false,
		include_dotblogsubdomain: ! queryOptions.only_wordpressdotcom || false,
		only_wordpressdotcom: false,
		quantity: 5,
		vendor: 'variation2_front',

		// Merge options
		...queryOptions,

		// Add the search query
		query: search.trim().toLocaleLowerCase(),
	};
}
