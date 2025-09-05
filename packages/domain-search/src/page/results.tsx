import { __experimentalVStack as VStack } from '@wordpress/components';
import { Cart } from '../components/cart';
import { FeaturedSearchResults } from '../components/featured-search-results';
import { SearchBar } from '../components/search-bar';
import { SearchNotice } from '../components/search-notice';
import { SearchResults } from '../components/search-results';
import { SkipSuggestion } from '../components/skip-suggestion';
import { UnavailableSearchResult } from '../components/unavailable-search-result';
import { useSuggestionsList } from '../hooks/use-suggestions-list';
import { useDomainSearch } from './context';

export const ResultsPage = () => {
	const { slots, config } = useDomainSearch();

	const { isLoading, featuredSuggestions, regularSuggestions } = useSuggestionsList();

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
				{ config.skippable && (
					<> { isLoading ? <SkipSuggestion.Placeholder /> : <SkipSuggestion /> } </>
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
