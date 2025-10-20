import {
	type DomainAvailability,
	type DomainSuggestion,
	DomainAvailabilityStatus,
} from '@automattic/api-core';

export const convertAvailabilityToSuggestion = (
	availability: DomainAvailability
): DomainSuggestion => {
	return {
		product_id: availability.product_id ?? 0,
		product_slug: availability.product_slug ?? 'domain_registration',
		raw_price: availability.raw_price ?? 0,
		relevance: 1, // It's an exact match
		max_reg_years: 10,
		multi_year_reg_allowed: true,
		vendor: availability.vendor ?? 'availability',
		is_premium:
			availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM ? true : undefined,
		...availability,
	};
};
