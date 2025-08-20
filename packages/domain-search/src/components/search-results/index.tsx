import { useQuery } from '@tanstack/react-query';
import { getFeaturedSuggestions } from '../../helpers/get-featured-suggestions';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestionsList } from '../../ui';
import { SearchResultsItem } from './item';
import { SearchResultsPlaceholder } from './placeholder';

const SearchResults = () => {
	const { query, queries } = useDomainSearch();
	const { data: suggestions } = useQuery( {
		...queries.domainSuggestions( query ),
		select: ( data ) => {
			const featuredSuggestions = getFeaturedSuggestions( data, query );

			return data.filter(
				( suggestion ) =>
					! featuredSuggestions.some(
						( featured ) => featured.suggestion.domain_name === suggestion.domain_name
					)
			);
		},
	} );

	return (
		<DomainSuggestionsList>
			{ suggestions?.map( ( suggestion ) => (
				<SearchResultsItem key={ suggestion.domain_name } domainName={ suggestion.domain_name } />
			) ) }
		</DomainSuggestionsList>
	);
};

SearchResults.Placeholder = SearchResultsPlaceholder;

export { SearchResults };
