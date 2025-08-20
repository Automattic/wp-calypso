import { useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestionsList } from '../../ui';
import { SearchResultsItem } from './item';
import { SearchResultsPlaceholder } from './placeholder';

const SearchResults = () => {
	const { query, queries } = useDomainSearch();
	const { data: suggestions } = useQuery( queries.domainSuggestions( query ) );

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
