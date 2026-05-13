import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { DefinedUseQueryResult, useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
	getTld,
	isFreeSubdomainQuery,
	isWpcomSubdomainQuery,
	stripWpcomSubdomainSuffix,
} from '../helpers';
import { addAvailabilityAsSuggestion } from '../helpers/add-availability-as-suggestion';
import { isSupportedPremiumDomain } from '../helpers/is-supported-premium-domain';
import { partitionSuggestions } from '../helpers/partition-suggestions';
import { useDomainSearch } from '../page/context';
import type { DomainSearchContextType } from '../page/types';

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

/**
 * Whether the FQDN the user searched for can itself be offered as a suggestion
 * (available to register, an owned domain we can resurface, or a supported
 * premium domain).
 */
const canUseFqdnAsSuggestion = (
	availability: DomainAvailability,
	config: DomainSearchContextType[ 'config' ]
): boolean => {
	if ( availability.status === DomainAvailabilityStatus.AVAILABLE ) {
		return true;
	}

	if (
		config.includeOwnedDomainInSuggestions &&
		availability.status === DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER
	) {
		return true;
	}

	return isSupportedPremiumDomain( availability );
};

export const useSuggestionsList = () => {
	const { query, queries, config } = useDomainSearch();

	const isFreeSubdomain = isFreeSubdomainQuery( query );
	const freeSuggestionQuery = isWpcomSubdomainQuery( query )
		? stripWpcomSubdomainSuffix( query )
		: query;

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery( {
		...queries.domainSuggestions( query ),
		enabled: true,
	} );

	const isFqdnQuery = ! isFreeSubdomain && !! getTld( query );

	const { isLoading: isLoadingQueryAvailability, data: fqdnAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: isFqdnQuery,
	} );

	// A non-FQDN search always offers the free subdomain. For an FQDN search,
	// we only offer the subdomain once the FQDN check confirms the user can't
	// use the domain they entered (registered elsewhere, invalid name,
	// unsupported TLD, etc.) — when the FQDN is usable, intent to purchase is
	// high and we let them proceed with their custom domain.
	const isFqdnUnusable =
		isFqdnQuery && !! fqdnAvailability && ! canUseFqdnAsSuggestion( fqdnAvailability, config );

	const { isLoading: isLoadingFreeSuggestion } = useQuery( {
		...queries.freeSuggestion( freeSuggestionQuery ),
		enabled: config.skippable && ( ! isFqdnQuery || isFqdnUnusable ),
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
		if ( suggestions && fqdnAvailability && query === fqdnAvailability.domain_name ) {
			addAvailabilityAsSuggestion( suggestions, fqdnAvailability );
		}

		return partitionSuggestions( {
			suggestions: suggestions
				.filter( ( { domain_name: suggestion, is_premium } ) => {
					if ( suggestion !== query ) {
						return ! is_premium || availablePremiumDomains.includes( suggestion );
					}

					if ( ! fqdnAvailability ) {
						return false;
					}

					return canUseFqdnAsSuggestion( fqdnAvailability, config );
				} )
				.map( ( suggestion ) => suggestion.domain_name ),
			query,
			deemphasizedTlds: config.deemphasizedTlds,
		} );
	}, [ suggestions, query, config, availablePremiumDomains, fqdnAvailability ] );

	return {
		isLoading,
		featuredSuggestions,
		regularSuggestions,
	};
};
