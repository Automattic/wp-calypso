/**
 * Internal dependencies
 */
import type { DomainSuggestion, DomainSuggestionQuery, DomainCategory } from './types';

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

export type Action = ReturnType< typeof receiveCategories | typeof receiveDomainSuggestions >;
