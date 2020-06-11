/**
 * External dependencies
 */
import type { DomainSuggestions } from '@automattic/data-stores';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export function getFreeDomainSuggestions( allSuggestions: DomainSuggestion[] | undefined ) {
	return allSuggestions?.filter( ( suggestion ) => suggestion.is_free );
}

// FIX ME: this function is duplicated within the domain-picker package
export function getPaidDomainSuggestions( allSuggestions: DomainSuggestion[] | undefined ) {
	return allSuggestions?.filter( ( suggestion ) => ! suggestion.is_free );
}

// Recommend either an exact match or the highest relevance score
// FIX ME: this function is duplicated within the domain-picker package
export function getRecommendedDomainSuggestion( allSuggestions: DomainSuggestion[] | undefined ) {
	if ( ! ( Array.isArray( allSuggestions ) && allSuggestions.length > 0 ) ) {
		return;
	}
	const recommendedSuggestion = allSuggestions?.reduce( ( result, suggestion ) => {
		if ( result.match_reasons && result.match_reasons.indexOf( 'exact-match' ) > -1 ) {
			return result;
		}
		if ( suggestion.match_reasons && suggestion.match_reasons.indexOf( 'exact-match' ) > -1 ) {
			return suggestion;
		}
		if ( suggestion.relevance > result.relevance ) {
			return suggestion;
		}
		return result;
	} );

	return recommendedSuggestion;
}
