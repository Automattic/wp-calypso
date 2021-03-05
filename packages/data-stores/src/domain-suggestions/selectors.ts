/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY, DataStatus } from './constants';
import type { DomainSuggestionQuery } from './types';
import type { State } from './reducer';
import { stringifyDomainQueryObject } from './utils';

type DomainSuggestionSelectorOptions = Partial< Exclude< DomainSuggestionQuery, 'query' > >;

const createSelectors = ( vendor: string ) => {
	function getDomainSuggestionVendor() {
		return vendor;
	}

	function getCategories( state: State ) {
		// Sort domain categories by tier, then by title.
		return [
			...state.categories
				.filter( ( { tier } ) => tier !== null )
				.sort( ( a, b ) => ( a > b ? 1 : -1 ) ),
			...state.categories
				.filter( ( { tier } ) => tier === null )
				.sort( ( a, b ) => a.title.localeCompare( b.title ) ),
		];
	}

	function getDomainSuggestions(
		_state: State,
		search: string,
		options: DomainSuggestionSelectorOptions = {}
	) {
		const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

		// We need to go through the `select` store to get the resolver action
		return select( STORE_KEY ).__internalGetDomainSuggestions( normalizedQuery );
	}

	function getDomainState( state: State ): DataStatus {
		return state.domainSuggestions.state;
	}

	function getDomainErrorMessage( state: State ): string | null {
		return state.domainSuggestions.errorMessage;
	}

	// TODO: reconcile this function with "Pending" status?
	// It doesn't seem to be used
	function isLoadingDomainSuggestions(
		_state: State,
		search: string,
		options: DomainSuggestionSelectorOptions = {}
	) {
		const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

		return select( 'core/data' ).isResolving( STORE_KEY, '__internalGetDomainSuggestions', [
			normalizedQuery,
		] );
	}

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
			include_dotblogsubdomain: false,
			only_wordpressdotcom: false,
			quantity: 5,
			vendor,

			// Merge options
			...queryOptions,

			// Add the search query
			query: search.trim().toLocaleLowerCase(),
		};
	}

	/**
	 * Do not use this selector. It is for internal use.
	 *
	 * @param state Store state
	 * @param queryObject Normalized object representing the query
	 * @returns suggestions
	 */
	function __internalGetDomainSuggestions( state: State, queryObject: DomainSuggestionQuery ) {
		return state.domainSuggestions.data[ stringifyDomainQueryObject( queryObject ) ];
	}

	function isAvailable( state: State, domainName: string ) {
		return state.availability[ domainName ];
	}

	function getDomainAvailabilities( state: State ) {
		return state.availability;
	}

	return {
		getCategories,
		getDomainSuggestions,
		getDomainState,
		getDomainErrorMessage,
		getDomainSuggestionVendor,
		isLoadingDomainSuggestions,
		__internalGetDomainSuggestions,
		isAvailable,
		getDomainAvailabilities,
	};
};

export type Selectors = ReturnType< typeof createSelectors >;

export default createSelectors;
