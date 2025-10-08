import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getTld } from '../helpers';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from '../page/context';

export const useSuggestionsList = () => {
	const { query, queries, config } = useDomainSearch();

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery( {
		...queries.domainSuggestions( query ),
		enabled: true,
	} );

	const { isLoading: isLoadingFreeSuggestion } = useQuery( {
		...queries.freeSuggestion( query ),
		enabled: config.skippable,
	} );

	const { isLoading: isLoadingQueryAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: !! getTld( query ),
	} );

	// We need to check the availability not only of all premium suggestions, but also of the suggestion
	// that's the same as the query. That's because sometimes we get suggestions that are premium but
	// are not marked as such, and we might need to remove that from the suggestions list.
	const suggestionsNeedingAvailabilityCheck = useMemo(
		() =>
			suggestions
				.filter( ( suggestion ) => suggestion.is_premium || suggestion.domain_name === query )
				.map( ( suggestion ) => suggestion.domain_name ),
		[ suggestions, query ]
	);

	const unavailablePremiumDomainsCombinator = useCallback(
		( results: UseQueryResult< DomainAvailability, Error >[] ) => {
			return {
				isLoadingUnavailablePremiumDomains: results.some( ( result ) => result.isLoading ),
				unavailablePremiumDomains: suggestionsNeedingAvailabilityCheck.filter( ( _, index ) => {
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
		[ suggestionsNeedingAvailabilityCheck ]
	);

	const { isLoadingUnavailablePremiumDomains, unavailablePremiumDomains } = useQueries( {
		queries: suggestionsNeedingAvailabilityCheck.map( ( suggestion ) => ( {
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
