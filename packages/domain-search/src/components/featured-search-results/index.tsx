import { FeaturedSuggestionWithReason } from '../../helpers/partition-featured-suggestions';
import { FeaturedDomainSuggestionsList } from '../../ui';
import { FeaturedSearchResultsItem } from './item';
import { FeaturedSearchResultsPlaceholder } from './placeholder';

const FeaturedSearchResults = ( {
	suggestions,
}: {
	suggestions: FeaturedSuggestionWithReason[];
} ) => {
	const isSingleFeaturedSuggestion = suggestions.length === 1;

	return (
		<FeaturedDomainSuggestionsList>
			{ suggestions.map( ( { reason, suggestion } ) => (
				<FeaturedSearchResultsItem
					key={ suggestion }
					domainName={ suggestion }
					reason={ reason }
					isSingleFeaturedSuggestion={ isSingleFeaturedSuggestion }
				/>
			) ) }
		</FeaturedDomainSuggestionsList>
	);
};

FeaturedSearchResults.Placeholder = FeaturedSearchResultsPlaceholder;

export { FeaturedSearchResults };
