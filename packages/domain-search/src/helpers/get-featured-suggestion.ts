import { DomainSuggestion } from '../queries/suggestions';

export type FeaturedSuggestionReason = 'exact-match' | 'recommended' | 'best-alternative';

interface FeaturedDomainWithReason {
	suggestion: DomainSuggestion;
	reason: FeaturedSuggestionReason;
}

export const getFeaturedSuggestions = (
	suggestions: DomainSuggestion[],
	query: string
): FeaturedDomainWithReason[] => {
	const featuredSuggestions: FeaturedDomainWithReason[] = [];

	for ( const suggestion of suggestions ) {
		if ( suggestion.domain_name === query ) {
			return [
				{
					suggestion,
					reason: 'exact-match',
				},
			];
		}

		if ( suggestion.domain_name === 'recommended-example.com' ) {
			featuredSuggestions.push( {
				suggestion,
				reason: 'recommended',
			} );
		}

		if ( suggestion.domain_name === 'best-alternative-example.org' ) {
			featuredSuggestions.push( {
				suggestion,
				reason: 'best-alternative',
			} );
		}
	}

	return featuredSuggestions;
};
