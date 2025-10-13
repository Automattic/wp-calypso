import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { DefinedUseQueryResult, useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTld } from '../helpers';
import { isSupportedPremiumDomain } from '../helpers/is-supported-premium-domain';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from '../page/context';

const hasDataAndIsSupportedPremiumDomain = (
	result: UseQueryResult< DomainAvailability, Error >
): result is DefinedUseQueryResult< DomainAvailability, Error > => {
	return !! result.data && isSupportedPremiumDomain( result.data );
};

const availablePremiumDomainsCombinator = (
	results: UseQueryResult< DomainAvailability, Error >[]
) => {
	return {
		isLoadingAvailablePremiumDomains: results.some( ( result ) => result.isLoading ),
		availablePremiumDomains: results
			.filter( hasDataAndIsSupportedPremiumDomain )
			.map( ( { data: availabilityQuery } ) => availabilityQuery.domain_name ),
	};
};

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

	const { isLoading: isLoadingQueryAvailability, data: fqdnAvailability } = useQuery( {
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

	const availabilityResults = useQueries( {
		queries: premiumSuggestions.map( ( suggestion ) => ( {
			...queries.domainAvailability( suggestion ),
			enabled: true,
		} ) ),
	} );

	const { isLoadingAvailablePremiumDomains, availablePremiumDomains } = useMemo(
		() => availablePremiumDomainsCombinator( availabilityResults ),
		[ availabilityResults ]
	);

	const isLoading =
		isLoadingSuggestions ||
		isLoadingFreeSuggestion ||
		isLoadingQueryAvailability ||
		isLoadingAvailablePremiumDomains;

	const { featuredSuggestions, regularSuggestions } = useMemo( () => {
		return partitionSuggestions( {
			suggestions: suggestions
				.filter( ( { domain_name: suggestion, is_premium } ) => {
					if ( suggestion !== query ) {
						return ! is_premium || availablePremiumDomains.includes( suggestion );
					}

					if ( ! fqdnAvailability ) {
						return false;
					}

					if (
						fqdnAvailability.status === DomainAvailabilityStatus.AVAILABLE ||
						( config.includeOwnedDomainInSuggestions &&
							fqdnAvailability.status === DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER )
					) {
						return true;
					}

					return isSupportedPremiumDomain( fqdnAvailability );
				} )
				.map( ( suggestion ) => suggestion.domain_name ),
			query,
			deemphasizedTlds: config.deemphasizedTlds,
		} );
	}, [
		suggestions,
		query,
		config.deemphasizedTlds,
		availablePremiumDomains,
		fqdnAvailability,
		config.includeOwnedDomainInSuggestions,
	] );

	return {
		isLoading,
		featuredSuggestions,
		regularSuggestions,
	};
};
