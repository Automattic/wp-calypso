import { FeaturedSuggestionWithReason } from '../../helpers/partition-suggestions';
import { FeaturedDomainSuggestionsList } from '../../ui';
import { FeaturedSearchResultsItem } from './item';
import { FeaturedSearchResultsPlaceholder } from './placeholder';

const FeaturedSearchResults = ( {
	suggestions,
	additionalItem,
}: {
	suggestions: FeaturedSuggestionWithReason[];
	additionalItem?: React.ReactNode;
} ) => {
	// When a bundle card shares the row, the sole suggestion is no longer alone,
	// so it uses the compact (paired) layout rather than the wide single layout.
	const isSingleFeaturedSuggestion = suggestions.length === 1 && ! additionalItem;

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
			{ additionalItem }
		</FeaturedDomainSuggestionsList>
	);
};

FeaturedSearchResults.Placeholder = FeaturedSearchResultsPlaceholder;

export { FeaturedSearchResults };
