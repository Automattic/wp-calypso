import {
	DomainAvailability,
	DomainAvailabilityStatus,
	DomainSuggestion,
} from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTld } from '../helpers/get-tld';
import { useDomainSearch } from '../page/context';

const convertAvailabilityToSuggestion = ( availability: DomainAvailability ): DomainSuggestion => {
	return {
		domain_name: availability.domain_name,
		cost: availability.cost,
		currency_code: availability.currency_code,
		product_id: availability.product_id ?? 0,
		product_slug: availability.product_slug ?? 'domain_registration',
		raw_price: availability.raw_price ?? 0,
		relevance: 1, // It's an exact match
		max_reg_years: 10,
		multi_year_reg_allowed: true,
		supports_privacy: availability.supports_privacy,
		vendor: availability.vendor ?? 'availability',
		is_premium:
			availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM ? true : undefined,
		renew_cost: availability.renew_cost,
		sale_cost: availability.sale_cost,
		hsts_required: availability.hsts_required,
		dot_gay_notice_required: availability.dot_gay_notice_required,
		match_reasons: availability.match_reasons,
	};
};

/**
 * Returns a list of domain suggestions for the query in the domain search context.
 * If the searchquery is a FQDN and it's available, it will be added to the suggestions list.
 */
export const useDomainSuggestions = () => {
	const { query, queries } = useDomainSearch();

	const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery( {
		...queries.domainSuggestions( query ),
		enabled: true,
	} );

	const { data: fqdnAvailability } = useQuery( {
		...queries.domainAvailability( query ),
		enabled: !! getTld( query ),
	} );

	const enhancedSuggestions = useMemo( () => {
		const baseSuggestions = suggestions || [];

		// If we have availability data for the exact query and it's available, add it to suggestions
		if (
			fqdnAvailability &&
			( fqdnAvailability.status === DomainAvailabilityStatus.AVAILABLE ||
				fqdnAvailability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM )
		) {
			const isAlreadyInSuggestions = baseSuggestions.some(
				( suggestion ) => suggestion.domain_name === fqdnAvailability.domain_name
			);

			if ( ! isAlreadyInSuggestions ) {
				const availabilityAsSuggestion = convertAvailabilityToSuggestion( fqdnAvailability );
				return [ availabilityAsSuggestion, ...baseSuggestions ];
			}
		}

		return baseSuggestions;
	}, [ suggestions, fqdnAvailability ] );

	return {
		suggestions: enhancedSuggestions,
		isLoading: isLoadingSuggestions,
	};
};
