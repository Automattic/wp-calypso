import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { getTld } from './get-tld';

export type FeaturedSuggestionReason = 'exact-match' | 'recommended' | 'best-alternative';

export interface FeaturedSuggestionWithReason {
	suggestion: string;
	reason: FeaturedSuggestionReason;
}

interface PartitionedSuggestions {
	featuredSuggestions: FeaturedSuggestionWithReason[];
	regularSuggestions: string[];
}

interface PartitionSuggestionsParams {
	suggestions: string[];
	query: string;
	deemphasizedTlds: string[];
	fqdnAvailability: DomainAvailability | undefined;
}

export const partitionSuggestions = ( {
	suggestions,
	query,
	deemphasizedTlds,
	fqdnAvailability,
}: PartitionSuggestionsParams ): PartitionedSuggestions => {
	const exactMatch = suggestions.find( ( suggestion ) => suggestion === query );

	// If a user searches for a FQDN and it's available, even if it's not in the suggestions list,
	// we should always show it first
	if ( fqdnAvailability && fqdnAvailability.status === DomainAvailabilityStatus.AVAILABLE ) {
		return {
			featuredSuggestions: [
				{
					suggestion: fqdnAvailability.domain_name,
					reason: 'exact-match',
				},
			],
			regularSuggestions: suggestions.filter( ( suggestion ) => suggestion !== query ),
		};
	}

	if ( exactMatch && ! deemphasizedTlds.some( ( tld ) => getTld( exactMatch ) === tld ) ) {
		return {
			featuredSuggestions: [
				{
					suggestion: exactMatch,
					reason: 'exact-match',
				},
			],
			regularSuggestions: suggestions.filter( ( suggestion ) => suggestion !== query ),
		};
	}

	const featuredSuggestions: FeaturedSuggestionWithReason[] = [];
	const regularSuggestions: string[] = [];

	for ( const suggestion of suggestions ) {
		if ( deemphasizedTlds.some( ( tld ) => getTld( suggestion ) === tld ) ) {
			regularSuggestions.push( suggestion );
			continue;
		}

		if ( ! featuredSuggestions.find( ( { reason } ) => reason === 'recommended' ) ) {
			featuredSuggestions.push( {
				suggestion: suggestion,
				reason: 'recommended',
			} );
			continue;
		}

		if ( ! featuredSuggestions.find( ( { reason } ) => reason === 'best-alternative' ) ) {
			featuredSuggestions.push( {
				suggestion: suggestion,
				reason: 'best-alternative',
			} );
			continue;
		}

		regularSuggestions.push( suggestion );
	}

	return {
		featuredSuggestions,
		regularSuggestions,
	};
};
