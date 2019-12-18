/**
 * Internal dependencies
 */
import { ActionType, DomainSuggestion, DomainSuggestionQuery } from './types';

export const receiveDomainSuggestions = (
	queryObject: DomainSuggestionQuery,
	suggestions: DomainSuggestion[] | undefined
) => ( {
	type: ActionType.RECEIVE_DOMAIN_SUGGESTIONS as const,
	queryObject,
	suggestions,
} );
