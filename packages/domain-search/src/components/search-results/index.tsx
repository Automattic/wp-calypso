import { useCallback, useState } from 'react';
import { useInlineBundles } from '../../hooks/use-inline-bundles';
import { useDomainSearch } from '../../page/context';
import {
	DomainSuggestionsList,
	DomainSuggestionFilterReset,
	DomainSuggestionLoadMore,
} from '../../ui';
import { InlineBundleRow } from '../inline-bundle-row';
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
	const { getInlineBundle } = useInlineBundles();
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
				{ suggestionsToShow.flatMap( ( suggestion ) => {
					const row = <SearchResultsItem key={ suggestion } domainName={ suggestion } />;
					const inlineBundle = getInlineBundle( suggestion );

					// Only emit an inline row when this domain is a trigger in the cart
					// and it either has a bundle or is still fetching one. DomainSuggestionsList
					// flattens children and inserts dividers, so an adjacent array slots in.
					if ( ! inlineBundle || ( ! inlineBundle.isLoading && ! inlineBundle.bundle ) ) {
						return [ row ];
					}

					return [
						row,
						<InlineBundleRow
							key={ `${ suggestion }-bundle` }
							bundle={ inlineBundle.bundle }
							isLoading={ inlineBundle.isLoading }
						/>,
					];
				} ) }
			</DomainSuggestionsList>
			{ shouldShowMoreResultsButton && <DomainSuggestionLoadMore onClick={ showMoreResults } /> }
		</>
	);
};

SearchResults.Placeholder = SearchResultsPlaceholder;

export { SearchResults };
