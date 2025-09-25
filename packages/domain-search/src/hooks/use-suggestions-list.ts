import {
	type DomainAvailability,
	DomainAvailabilityStatus,
	fetchDomainAvailability,
} from '@automattic/api-core';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { getTld } from '../helpers';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from '../page/context';

export const useSuggestionsList = () => {
	const { query, queries, config, events } = useDomainSearch();

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery( {
		...queries.domainSuggestions( query ),
		enabled: true,
		// We should just get suggestions when the query changes
		staleTime: Infinity,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	} );

	useEffect( () => {
		if ( ! isLoadingSuggestions && suggestions.length > 0 ) {
			events.onSuggestionsReceive(
				query,
				suggestions.map( ( suggestion ) => suggestion.domain_name )
			);
		}
	}, [ suggestions, isLoadingSuggestions, events, query ] );

	const { isLoading: isLoadingFreeSuggestion } = useQuery( queries.freeSuggestion( query ) );

	const { isLoading: isLoadingQueryAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: !! getTld( query ),
		queryFn: async () => {
			const start = Date.now();
			const availability = await fetchDomainAvailability( query );
			const availabilityResponseTime = Date.now() - start;
			if ( availability ) {
				events.onQueryAvailabilityCheck( availability.status, query, availabilityResponseTime );
			}
			return availability;
		},
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
			deemphasizedTlds: config.deemphasizedTlds,
		} );
	}, [ suggestions, query, config.deemphasizedTlds, unavailablePremiumDomains ] );

	return {
		isLoading,
		featuredSuggestions,
		regularSuggestions,
	};
};
