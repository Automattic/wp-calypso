import { ReactNode } from 'react';
import { FeaturedSuggestionWithReason } from '../../helpers/partition-suggestions';
import { FeaturedDomainSuggestionsList } from '../../ui';
import { FeaturedSearchResultsItem } from './item';
import { FeaturedSearchResultsPlaceholder } from './placeholder';

const FeaturedSearchResults = ( {
	suggestions,
	children,
}: {
	suggestions: FeaturedSuggestionWithReason[];
	children?: ReactNode;
} ) => {
	// A trailing card (the bundle card on the FQDN path) shares the featured row, so
	// a lone exact-match card is no longer "single": it renders in the narrower
	// column form beside the bundle card rather than the full-width horizontal one.
	const isSingleFeaturedSuggestion = suggestions.length === 1 && ! children;

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
			{ children }
		</FeaturedDomainSuggestionsList>
	);
};

FeaturedSearchResults.Placeholder = FeaturedSearchResultsPlaceholder;

export { FeaturedSearchResults };
