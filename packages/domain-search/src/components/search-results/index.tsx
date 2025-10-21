import { useCallback, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	DomainSuggestionsList,
	DomainSuggestionFilterReset,
	DomainSuggestionLoadMore,
} from '../../ui';
import { SearchResultsItem } from './item';
import { SearchResultsPlaceholder } from './placeholder';

const SearchResults = ( {
	suggestions,
	numberOfInitialVisibleSuggestions,
}: {
	suggestions: string[];
	numberOfInitialVisibleSuggestions?: number;
} ) => {
	const { filter, resetFilter, events, config } = useDomainSearch();
	const [ numberOfVisibleSuggestions, setnumberOfVisibleSuggestions ] = useState(
		numberOfInitialVisibleSuggestions ?? config.numberOfDomainsResultsPerPage
	);
	const [ pageNumber, setPageNumber ] = useState( 1 );

	const showMoreResults = useCallback( () => {
		events.onShowMoreResults( pageNumber + 1 );
		setPageNumber( pageNumber + 1 );
		setnumberOfVisibleSuggestions(
			numberOfVisibleSuggestions + config.numberOfDomainsResultsPerPage
		);
	}, [ events, pageNumber, numberOfVisibleSuggestions, config.numberOfDomainsResultsPerPage ] );

	const hasActiveFilters = filter.exactSldMatchesOnly || filter.tlds.length > 0;

	if ( suggestions.length === 0 ) {
		if ( hasActiveFilters ) {
			return <DomainSuggestionFilterReset onClick={ resetFilter } />;
		}

		return null;
	}

	const shouldShowMoreResultsButton = numberOfVisibleSuggestions < suggestions.length;
	const suggestionsToShow = suggestions.slice( 0, numberOfVisibleSuggestions );

	return (
		<>
			<DomainSuggestionsList>
				{ suggestionsToShow.map( ( suggestion ) => (
					<SearchResultsItem key={ suggestion } domainName={ suggestion } />
				) ) }
			</DomainSuggestionsList>
			{ shouldShowMoreResultsButton && <DomainSuggestionLoadMore onClick={ showMoreResults } /> }
		</>
	);
};

SearchResults.Placeholder = SearchResultsPlaceholder;

export { SearchResults };
