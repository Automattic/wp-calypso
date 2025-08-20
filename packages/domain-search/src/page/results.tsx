import { useQueries, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { Cart } from '../components/cart';
import { FeaturedSearchResults } from '../components/featured-search-results';
import { SearchBar } from '../components/search-bar';
import { SearchResults } from '../components/search-results';
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

	return (
		<VStack spacing={ 8 }>
			<SearchBar />
			{ slots?.BeforeResults && <slots.BeforeResults /> }
			<VStack spacing={ 4 }>
				{ isLoading ? <FeaturedSearchResults.Placeholder /> : <FeaturedSearchResults /> }
				{ isLoading ? <SearchResults.Placeholder /> : <SearchResults /> }
			</VStack>
			<Cart />
		</VStack>
	);
};
