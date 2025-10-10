import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getTld } from '../helpers';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from '../page/context';

const isSupportedPremiumDomain = ( availability: DomainAvailability ) => {
	return (
		availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM &&
		availability.is_supported_premium_domain
	);
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

	const unavailablePremiumDomainsCombinator = useCallback(
		( results: UseQueryResult< DomainAvailability, Error >[] ) => {
			return {
				isLoadingUnavailablePremiumDomains: results.some( ( result ) => result.isLoading ),
				unavailablePremiumDomains: premiumSuggestions.filter( ( _, index ) => {
					const availabilityQuery = results[ index ].data;

					return ! availabilityQuery || ! isSupportedPremiumDomain( availabilityQuery );
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
				.filter( ( suggestion ) => {
					if ( suggestion !== query ) {
						return ! unavailablePremiumDomains.includes( suggestion );
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
				} ),
			query,
			deemphasizedTlds: config.deemphasizedTlds,
		} );
	}, [
		suggestions,
		query,
		config.deemphasizedTlds,
		unavailablePremiumDomains,
		fqdnAvailability,
		config.includeOwnedDomainInSuggestions,
	] );

	return {
		isLoading,
		featuredSuggestions,
		regularSuggestions,
	};
};
