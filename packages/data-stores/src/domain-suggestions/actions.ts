/**
 * Internal dependencies
 */
import { DomainSuggestion, DomainSuggestionQuery } from './types';

export const receiveDomainSuggestions = (
	queryObject: DomainSuggestionQuery,
	suggestions: DomainSuggestion[] | undefined
) => ( {
	type: 'RECEIVE_DOMAIN_SUGGESTIONS' as const,
	queryObject,
	suggestions,
} );

export type Action = ReturnType< typeof receiveDomainSuggestions >;
