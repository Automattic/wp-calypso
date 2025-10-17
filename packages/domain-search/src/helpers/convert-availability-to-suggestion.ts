import {
	type DomainAvailability,
	type DomainSuggestion,
	DomainAvailabilityStatus,
} from '@automattic/api-core';

export const convertAvailabilityToSuggestion = (
	availability: DomainAvailability
): DomainSuggestion => {
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
