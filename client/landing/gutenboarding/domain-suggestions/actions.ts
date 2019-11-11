/**
 * Internal dependencies
 */
import { ActionType, DomainSuggestion } from './types';

export const receiveDomainSuggestions = ( domainSuggestions: DomainSuggestion[] ) => ( {
	type: ActionType.RECEIVE_DOMAIN_SUGGESTIONS as const,
	domainSuggestions,
} );
