/**
 * Internal dependencies
 */
import type { DomainAvailability, DomainSuggestion, DomainSuggestionQuery } from './types';

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
	typeof receiveDomainSuggestions | typeof receiveDomainAvailability
>;
