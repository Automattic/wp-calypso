import type { DomainSuggestion } from '@automattic/data';

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
	suggestions: DomainSuggestion[];
	query: string;
	deemphasiseTlds: string[];
}

export const partitionSuggestions = ( {
	suggestions,
	query,
	deemphasiseTlds,
}: PartitionSuggestionsParams ): PartitionedSuggestions => {
	const exactMatch = suggestions.find( ( suggestion ) => suggestion.domain_name === query );

	if ( exactMatch ) {
		return {
			featuredSuggestions: [
				{
					suggestion: exactMatch.domain_name,
					reason: 'exact-match',
				},
			],
			regularSuggestions: suggestions
				.filter( ( suggestion ) => suggestion.domain_name !== query )
				.map( ( suggestion ) => suggestion.domain_name ),
		};
	}

	const featuredSuggestions: FeaturedSuggestionWithReason[] = [];
	const regularSuggestions: string[] = [];

	for ( const suggestion of suggestions ) {
		if ( deemphasiseTlds.some( ( tld ) => suggestion.domain_name.endsWith( `.${ tld }` ) ) ) {
			regularSuggestions.push( suggestion.domain_name );
			continue;
		}

		if ( ! featuredSuggestions.find( ( { reason } ) => reason === 'recommended' ) ) {
			featuredSuggestions.push( {
				suggestion: suggestion.domain_name,
				reason: 'recommended',
			} );
			continue;
		}

		if ( ! featuredSuggestions.find( ( { reason } ) => reason === 'best-alternative' ) ) {
			featuredSuggestions.push( {
				suggestion: suggestion.domain_name,
				reason: 'best-alternative',
			} );
			continue;
		}

		regularSuggestions.push( suggestion.domain_name );
	}

	return {
		featuredSuggestions,
		regularSuggestions,
	};
};
