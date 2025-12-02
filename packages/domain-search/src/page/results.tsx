import { __experimentalVStack as VStack } from '@wordpress/components';
import { Cart } from '../components/cart';
import { FeaturedSearchResults } from '../components/featured-search-results';
import { SearchBar } from '../components/search-bar';
import { SearchNotice } from '../components/search-notice';
import { SearchResults } from '../components/search-results';
import { SkipSuggestion } from '../components/skip-suggestion';
import { UnavailableSearchResult } from '../components/unavailable-search-result';
import { useDomainSearchEscapeHatch } from '../hooks/use-escape-hatch';
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
	const [ isLoadingExperiment, experimentVariation ] = useDomainSearchEscapeHatch();
	const isLoadingSuggestionsOrExperiment = isLoadingSuggestions || isLoadingExperiment;

	const showSkipSuggestionsAfterSearchBar =
		! isLoadingExperiment && experimentVariation === 'treatment_above_paid_domain_area';
	const showSkipSuggestionsBeforeFeaturedResults =
		! isLoadingExperiment &&
		[
			'treatment_paid_domain_area_skip_emphasis',
			'treatment_paid_domain_area_free_emphasis',
			'treatment_paid_domain_area_free_emphasis_extra_cta',
			'treatment_paid_domain_area',
		].includes( experimentVariation as string );
	const showSkipSuggestionsAfterFeaturedResults =
		! showSkipSuggestionsAfterSearchBar && ! showSkipSuggestionsBeforeFeaturedResults;

	useRequestTracking();

	return (
		<VStack spacing={ 8 } className="domain-search--results">
			<VStack spacing={ 4 }>
				<SearchBar />
				{ ! isLoadingSuggestions && <SearchNotice /> }
			</VStack>
			{ config.skippable && showSkipSuggestionsAfterSearchBar && (
				<>
					{ isLoadingSuggestionsOrExperiment ? <SkipSuggestion.Placeholder /> : <SkipSuggestion /> }
				</>
			) }
			{ slots?.BeforeResults && <slots.BeforeResults /> }
			<VStack spacing={ 4 }>
				{ config.skippable && showSkipSuggestionsBeforeFeaturedResults && (
					<>
						{ isLoadingSuggestionsOrExperiment ? (
							<SkipSuggestion.Placeholder />
						) : (
							<SkipSuggestion />
						) }
					</>
				) }
				{ ! isLoadingSuggestions && <UnavailableSearchResult /> }
				{ isLoadingSuggestions ? (
					<FeaturedSearchResults.Placeholder />
				) : (
					<FeaturedSearchResults suggestions={ featuredSuggestions } />
				) }
				{ config.skippable && showSkipSuggestionsAfterFeaturedResults && (
					<>
						{ isLoadingSuggestionsOrExperiment ? (
							<SkipSuggestion.Placeholder />
						) : (
							<SkipSuggestion />
						) }
					</>
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
