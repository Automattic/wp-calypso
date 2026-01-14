import { __experimentalVStack as VStack } from '@wordpress/components';
import { Cart } from '../components/cart';
import { FeaturedSearchResults } from '../components/featured-search-results';
import { SearchBar } from '../components/search-bar';
import { SearchNotice } from '../components/search-notice';
import { SearchResults } from '../components/search-results';
import { SkipSuggestion } from '../components/skip-suggestion';
import { UnavailableSearchResult } from '../components/unavailable-search-result';
import { useRequestTracking } from '../hooks/use-request-tracking';
import { useSuggestionsList } from '../hooks/use-suggestions-list';
import { useDomainSearch } from './context';

export const ResultsPage = () => {
	const { slots, config } = useDomainSearch();

	const {
		isLoading: isLoadingSuggestions,
		featuredSuggestions,
		regularSuggestions,
	} = useSuggestionsList();
	const numberOfInitialVisibleSuggestions =
		config.numberOfDomainsResultsPerPage - featuredSuggestions.length;

	useRequestTracking();

	return (
		<VStack spacing={ 8 } className="domain-search--results">
			<VStack spacing={ 4 }>
				<SearchBar />
				{ ! isLoadingSuggestions && <SearchNotice /> }
			</VStack>
			{ slots?.BeforeResults && <slots.BeforeResults /> }
			<VStack spacing={ 4 }>
				{ config.skippable && (
					<>{ isLoadingSuggestions ? <SkipSuggestion.Placeholder /> : <SkipSuggestion /> }</>
				) }
				{ ! isLoadingSuggestions && <UnavailableSearchResult /> }
				{ isLoadingSuggestions ? (
					<FeaturedSearchResults.Placeholder />
				) : (
					<FeaturedSearchResults suggestions={ featuredSuggestions } />
				) }
				{ isLoadingSuggestions ? (
					<SearchResults.Placeholder />
				) : (
					<SearchResults
						suggestions={ regularSuggestions }
						numberOfInitialVisibleSuggestions={ numberOfInitialVisibleSuggestions }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
