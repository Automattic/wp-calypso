import { useQuery } from '@tanstack/react-query';
import { getFeaturedSuggestions } from '../../helpers/get-featured-suggestions';
import { useDomainSearch } from '../../page/context';
import { FeaturedDomainSuggestionsList } from '../../ui';
import { FeaturedSearchResultsItem } from './item';
import { FeaturedSearchResultsPlaceholder } from './placeholder';

const FeaturedSearchResults = () => {
	const { query, queries } = useDomainSearch();
	const { data: featuredSuggestions = [] } = useQuery( {
		...queries.domainSuggestions( query ),
		select: ( data ) => getFeaturedSuggestions( data, query ),
	} );

	const isSingleFeaturedSuggestion = featuredSuggestions.length === 1;

	return (
		<FeaturedDomainSuggestionsList>
			{ featuredSuggestions.map( ( { reason, suggestion } ) => (
				<FeaturedSearchResultsItem
					key={ suggestion.domain_name }
					domainName={ suggestion.domain_name }
					reason={ reason }
					isSingleFeaturedSuggestion={ isSingleFeaturedSuggestion }
				/>
			) ) }
		</FeaturedDomainSuggestionsList>
	);
};

FeaturedSearchResults.Placeholder = FeaturedSearchResultsPlaceholder;

export { FeaturedSearchResults };
