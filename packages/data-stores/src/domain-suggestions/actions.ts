/**
 * Internal dependencies
 */
import { DomainSuggestion, DomainSuggestionQuery } from './types';

export const receiveCategories = ( categories: Record< string, string[] > ) =>
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
