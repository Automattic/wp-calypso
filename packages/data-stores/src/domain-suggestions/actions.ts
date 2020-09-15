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

export const receiveDomainSuggestions = (
	queryObject: DomainSuggestionQuery,
	suggestions: DomainSuggestion[] | undefined
) =>
	( {
		type: 'RECEIVE_DOMAIN_SUGGESTIONS',
		queryObject,
		suggestions,
	} as const );

export const receiveDomainAvailability = ( domainName: string, availability: DomainAvailability ) =>
	( {
		type: 'RECEIVE_DOMAIN_AVAILABILITY',
		domainName,
		availability,
	} as const );

export type Action = ReturnType<
	typeof receiveCategories | typeof receiveDomainSuggestions | typeof receiveDomainAvailability
>;
