import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getTld } from '../helpers';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from '../page/context';

export const useSuggestionsList = () => {
	const { query, queries, config, filter } = useDomainSearch();

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery( {
		...queries.domainSuggestions( query, {
			tlds: filter.tlds,
			exact_sld_matches_only: filter.exactSldMatchesOnly,
		} ),
		enabled: true,
	} );

	const { isLoading: isLoadingFreeSuggestion } = useQuery( queries.freeSuggestion( query ) );

	const { isLoading: isLoadingQueryAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: !! getTld( query ),
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

	return {
		isLoading,
		featuredSuggestions,
		regularSuggestions,
	};
};
