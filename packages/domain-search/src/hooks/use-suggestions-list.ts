import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { DefinedUseQueryResult, useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isFqdnQuery, isWpcomSubdomainQuery, stripWpcomSubdomainSuffix } from '../helpers';
import { addAvailabilityAsSuggestion } from '../helpers/add-availability-as-suggestion';
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

	const freeSuggestionQuery = isWpcomSubdomainQuery( query )
		? stripWpcomSubdomainSuffix( query )
		: query;

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery( {
		...queries.domainSuggestions( query ),
		enabled: true,
	} );

	const isFqdn = isFqdnQuery( query );

	const { isLoading: isLoadingFreeSuggestion } = useQuery( {
		...queries.freeSuggestion( freeSuggestionQuery ),
		enabled: config.skippable && ! isFqdn,
	} );

	// The top bundle card is the FQDN path only: a bare-term search shows inline
	// bundle rows instead (see useInlineBundles), and the backend returns no
	// bundle_suggestion for a bare term anyway. Gating on isFqdnQuery keeps this
	// request from duplicating the bare-term bundleTriggers request (same URL).
	// Still gated behind the frontend `domain-bundling` flag (config.showBundleSuggestions).
	const { data: bundleSuggestion } = useQuery( {
		...queries.bundleSuggestion( query ),
		enabled: config.showBundleSuggestions && isFqdn,
	} );

	const { isLoading: isLoadingQueryAvailability, data: fqdnAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: isFqdn,
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

	// Derived inline (not memoized): availabilityResults is a fresh array each
	// render, so memoizing on it gains nothing and trips @tanstack/query's
	// no-unstable-deps rule. Recomputing every render matches the previous
	// behaviour exactly.
	const { isLoadingAvailablePremiumDomains, availablePremiumDomains } =
		availablePremiumDomainsCombinator( availabilityResults );

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
		bundleSuggestion,
	};
};
