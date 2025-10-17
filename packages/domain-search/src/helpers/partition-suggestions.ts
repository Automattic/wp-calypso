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
}

export const partitionSuggestions = ( {
	suggestions,
	query,
	deemphasizedTlds,
}: PartitionSuggestionsParams ): PartitionedSuggestions => {
	const exactMatch = suggestions.find( ( suggestion ) => suggestion === query );

	// If we have an exact match, we always want to show it at the top, even if the TLD is deemphasized
	if ( exactMatch ) {
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
