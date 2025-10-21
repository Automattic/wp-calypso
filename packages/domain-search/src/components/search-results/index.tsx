import { useState } from 'react';
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
	const { filter, resetFilter } = useDomainSearch();
	const [ numberOfVisibleSuggestions, setnumberOfVisibleSuggestions ] = useState(
		numberOfInitialVisibleSuggestions ?? 10
	);
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
			{ shouldShowMoreResultsButton && (
				<DomainSuggestionLoadMore
					onClick={ () => setnumberOfVisibleSuggestions( numberOfVisibleSuggestions + 10 ) }
				/>
			) }
		</>
	);
};

SearchResults.Placeholder = SearchResultsPlaceholder;

export { SearchResults };
