/**
 * Internal dependencies
 */
import type {
	DomainSuggestion,
	DomainSuggestionQuery,
	DomainCategory,
	DomainAvailability,
} from './types';

export const receiveCategories = ( categories: DomainCategory[] ) =>
	( {
		type: 'RECEIVE_CATEGORIES',
		categories,
	} as const );

export const fetchDomainSuggestions = () =>
	( {
		type: 'FETCH_DOMAIN_SUGGESTIONS',
		timeStamp: Date.now(),
	} as const );

export const receiveDomainAvailability = ( domainName: string, availability: DomainAvailability ) =>
	( {
		type: 'RECEIVE_DOMAIN_AVAILABILITY',
		domainName,
		availability,
	} as const );

export const receiveDomainSuggestionsSuccess = (
	queryObject: DomainSuggestionQuery,
	suggestions: DomainSuggestion[] | undefined
) =>
	( {
		type: 'RECEIVE_DOMAIN_SUGGESTIONS_SUCCESS',
		queryObject,
		suggestions,
		timeStamp: Date.now(),
	} as const );

export const receiveDomainSuggestionsError = ( errorMessage: string ) =>
	( {
		type: 'RECEIVE_DOMAIN_SUGGESTIONS_ERROR',
		errorMessage,
		timeStamp: Date.now(),
	} as const );

export type Action = ReturnType<
	| typeof receiveCategories
	| typeof fetchDomainSuggestions
	| typeof receiveDomainSuggestionsSuccess
	| typeof receiveDomainSuggestionsError
	| typeof receiveDomainAvailability
>;
