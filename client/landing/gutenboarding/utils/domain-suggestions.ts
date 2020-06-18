/**
 * External dependencies
 */
import type { DomainSuggestions } from '@automattic/data-stores';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export function getFreeDomainSuggestions( allSuggestions: DomainSuggestion[] | undefined ) {
	return allSuggestions?.filter( ( suggestion ) => suggestion.is_free );
}
