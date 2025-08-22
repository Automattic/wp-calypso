import { DomainSuggestionItem, FeaturedDomainSuggestionsList } from '../../ui';

export const FeaturedSearchResultsPlaceholder = () => {
	return (
		<FeaturedDomainSuggestionsList>
			<DomainSuggestionItem.Featured.Placeholder />
			<DomainSuggestionItem.Featured.Placeholder />
		</FeaturedDomainSuggestionsList>
	);
};
