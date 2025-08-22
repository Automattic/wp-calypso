import { DomainSuggestion, FeaturedDomainSuggestionsList } from '../../ui';

export const FeaturedSearchResultsPlaceholder = () => {
	return (
		<FeaturedDomainSuggestionsList>
			<DomainSuggestion.Featured.Placeholder />
			<DomainSuggestion.Featured.Placeholder />
		</FeaturedDomainSuggestionsList>
	);
};
