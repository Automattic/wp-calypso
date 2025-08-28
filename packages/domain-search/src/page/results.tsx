import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/data';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useCallback, useMemo } from 'react';
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
	const { slots, query, queries, config } = useDomainSearch();

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery(
		queries.domainSuggestions( query )
	);

	const { isLoading: isLoadingFreeSuggestion } = useQuery( queries.freeSuggestion( query ) );

	const { isLoading: isLoadingQueryAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: true,
	} );

	const premiumSuggestions = useMemo(
		() =>
			suggestions
				.filter( ( suggestion ) => suggestion.is_premium )
				.map( ( suggestion ) => suggestion.domain_name ),
		[ suggestions ]
	);

	const unavailablePremiumDomainsCombinator = useCallback(
		( results: UseQueryResult< DomainAvailability, Error >[] ) => {
			return {
				isLoadingUnavailablePremiumDomains: results.some( ( result ) => result.isLoading ),
				unavailablePremiumDomains: premiumSuggestions.filter( ( _, index ) => {
					const availabilityQuery = results[ index ];

					if ( availabilityQuery?.error || ! availabilityQuery?.data ) {
						return true;
					}

					const { status, is_supported_premium_domain } = availabilityQuery.data;

					return (
						DomainAvailabilityStatus.AVAILABLE_PREMIUM !== status || ! is_supported_premium_domain
					);
				} ),
			};
		},
		[ premiumSuggestions ]
	);

	const { isLoadingUnavailablePremiumDomains, unavailablePremiumDomains } = useQueries( {
		queries: premiumSuggestions.map( ( suggestion ) => ( {
			...queries.domainAvailability( suggestion ),
			enabled: true,
		} ) ),
		combine: unavailablePremiumDomainsCombinator,
	} );

	const isLoading =
		isLoadingSuggestions ||
		isLoadingFreeSuggestion ||
		isLoadingQueryAvailability ||
		isLoadingUnavailablePremiumDomains;

	const { featuredSuggestions, regularSuggestions } = useMemo( () => {
		return partitionSuggestions( {
			suggestions: suggestions
				.map( ( suggestion ) => suggestion.domain_name )
				.filter( ( suggestion ) => ! unavailablePremiumDomains.includes( suggestion ) ),
			query,
			deemphasiseTlds: config.deemphasizedTlds,
		} );
	}, [ suggestions, query, config.deemphasizedTlds, unavailablePremiumDomains ] );

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
