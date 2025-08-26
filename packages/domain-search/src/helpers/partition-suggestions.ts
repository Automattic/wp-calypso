import type { DomainSuggestion } from '@automattic/data';

export type FeaturedSuggestionReason = 'exact-match' | 'recommended' | 'best-alternative';

export interface FeaturedSuggestionWithReason {
	suggestion: string;
	reason: FeaturedSuggestionReason;
}

interface PartitionedSuggestions {
	featuredSuggestions: FeaturedSuggestionWithReason[];
	freeSuggestion?: string;
	regularSuggestions: string[];
}

export const partitionSuggestions = (
	suggestions: DomainSuggestion[],
	query: string
): PartitionedSuggestions => {
	const exactMatch = suggestions.find( ( suggestion ) => suggestion.domain_name === query );

	if ( exactMatch ) {
		return {
			featuredSuggestions: [
				{
					suggestion: exactMatch.domain_name,
					reason: 'exact-match',
				},
			],
			freeSuggestion: suggestions.find( ( suggestion ) => suggestion.is_free )?.domain_name,
			regularSuggestions: suggestions
				.filter( ( suggestion ) => suggestion.domain_name !== query && ! suggestion.is_free )
				.map( ( suggestion ) => suggestion.domain_name ),
		};
	}

	return suggestions.reduce< PartitionedSuggestions >(
		( acc, suggestion ) => {
			if ( suggestion.domain_name === 'recommended-example.com' ) {
				acc.featuredSuggestions.push( {
					suggestion: suggestion.domain_name,
					reason: 'recommended',
				} );
			} else if ( suggestion.domain_name === 'best-alternative-example.org' ) {
				acc.featuredSuggestions.push( {
					suggestion: suggestion.domain_name,
					reason: 'best-alternative',
				} );
			} else if ( suggestion.is_free ) {
				acc.freeSuggestion = suggestion.domain_name;
			} else {
				acc.regularSuggestions.push( suggestion.domain_name );
			}

			return acc;
		},
		{
			featuredSuggestions: [],
			freeSuggestion: undefined,
			regularSuggestions: [],
		}
	);
};
