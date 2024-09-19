import { select } from '@wordpress/data';
import { STORE_KEY, DataStatus } from './constants';
import { stringifyDomainQueryObject, normalizeDomainSuggestionQuery } from './utils';
import type { State } from './reducer';
import type {
	DomainAvailability,
	DomainAvailabilities,
	DomainCategory,
	DomainSuggestion,
	DomainSuggestionQuery,
	DomainSuggestionSelectorOptions,
} from './types';

export const getCategories = ( state: State ): DomainCategory[] => {
	// Sort domain categories by tier, then by title.
	return [
		...state.categories
			.filter( ( { tier } ) => tier !== null )
			.sort( ( a, b ) => ( a > b ? 1 : -1 ) ),
		...state.categories
			.filter( ( { tier } ) => tier === null )
			.sort( ( a, b ) => a.title.localeCompare( b.title ) ),
	];
};

export const getDomainSuggestions = (
	_state: State,
	search: string,
	options: DomainSuggestionSelectorOptions = {}
): DomainSuggestion[] | undefined => {
	const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

	// We need to go through the `select` store to get the resolver action
	return (
		select( STORE_KEY ) as {
			__internalGetDomainSuggestions: (
				queryObject: DomainSuggestionQuery
			) => DomainSuggestion[] | undefined;
		}
	 ).__internalGetDomainSuggestions( normalizedQuery );
};

export const getDomainState = ( state: State ): DataStatus => {
	return state.domainSuggestions.state;
};

export const getDomainErrorMessage = ( state: State ): string | null => {
	return state.domainSuggestions.errorMessage;
};

// TODO: reconcile this function with "Pending" status?
// It doesn't seem to be used
export const isLoadingDomainSuggestions = (
	_state: State,
	search: string,
	options: DomainSuggestionSelectorOptions = {}
): boolean => {
	const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

	return (
		select( 'core/data' ) as {
			isResolving: ( storeKey: string, resolverName: string, args: unknown[] ) => boolean;
		}
	 ).isResolving( STORE_KEY, '__internalGetDomainSuggestions', [ normalizedQuery ] );
};

/**
 * Do not use this selector. It is for internal use.
 * @param state Store state
 * @param queryObject Normalized object representing the query
 * @returns suggestions
 */
export const __internalGetDomainSuggestions = (
	state: State,
	queryObject: DomainSuggestionQuery
): DomainSuggestion[] | undefined => {
	return state.domainSuggestions.data[ stringifyDomainQueryObject( queryObject ) ];
};

export const isAvailable = ( state: State, domainName: string ): DomainAvailability | undefined => {
	return state.availability[ domainName ];
};

export const getDomainAvailabilities = ( state: State ): DomainAvailabilities => {
	return state.availability;
};
