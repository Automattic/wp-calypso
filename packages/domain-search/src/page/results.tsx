import { useQueries, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from 'react';
import { Cart } from '../components/cart';
import { FeaturedSearchResults } from '../components/featured-search-results';
import { SearchBar } from '../components/search-bar';
import { SearchNotice } from '../components/search-notice';
import { SearchResults } from '../components/search-results';
import { SkipSuggestion } from '../components/skip-suggestion';
import { UnavailableSearchResult } from '../components/unavailable-search-result';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from './context';

export const ResultsPage = () => {
	const { slots, query, queries } = useDomainSearch();

	const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery(
		queries.domainSuggestions( query )
	);

	const { isLoading: isLoadingQueryAvailability } = useQuery( queries.domainAvailability( query ) );

	const domainAvailabilityQueries = useQueries( {
		queries:
			suggestions?.map( ( suggestion ) => ( {
				...queries.domainAvailability( suggestion.domain_name ),
			} ) ) ?? [],
	} );

	const isLoading =
		isLoadingSuggestions ||
		isLoadingQueryAvailability ||
		domainAvailabilityQueries.some( ( query ) => query.isLoading );

	const { featuredSuggestions, freeSuggestion, regularSuggestions } = useMemo( () => {
		return partitionSuggestions( suggestions ?? [], query );
	}, [ suggestions, query ] );

	return (
		<VStack spacing={ 8 }>
			<VStack spacing={ 4 }>
				<SearchBar />
				{ ! isLoading && <SearchNotice /> }
			</VStack>
			{ slots?.BeforeResults && <slots.BeforeResults /> }
			<VStack spacing={ 4 }>
				{ ! isLoading && <UnavailableSearchResult /> }
				{ isLoading ? (
					<FeaturedSearchResults.Placeholder />
				) : (
					<FeaturedSearchResults suggestions={ featuredSuggestions } />
				) }
				{ isLoading ? (
					<SkipSuggestion.Placeholder />
				) : (
					<SkipSuggestion freeSuggestion={ freeSuggestion } />
				) }
				{ isLoading ? (
					<SearchResults.Placeholder />
				) : (
					<SearchResults suggestions={ regularSuggestions } />
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
