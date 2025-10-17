import { useDomainSearch } from '../../page/context';
import { DomainSuggestionsList, DomainSuggestionFilterReset } from '../../ui';
import { SearchResultsItem } from './item';
import { SearchResultsPlaceholder } from './placeholder';

const SearchResults = ( { suggestions }: { suggestions: string[] } ) => {
	const { filter, resetFilter } = useDomainSearch();
	const hasActiveFilters = filter.exactSldMatchesOnly || filter.tlds.length > 0;

	if ( suggestions.length === 0 ) {
		if ( hasActiveFilters ) {
			return <DomainSuggestionFilterReset onClick={ resetFilter } />;
		}

		return null;
	}

	return (
		<DomainSuggestionsList>
			{ suggestions.map( ( suggestion ) => (
				<SearchResultsItem key={ suggestion } domainName={ suggestion } />
			) ) }
		</DomainSuggestionsList>
	);
};

SearchResults.Placeholder = SearchResultsPlaceholder;

export { SearchResults };
