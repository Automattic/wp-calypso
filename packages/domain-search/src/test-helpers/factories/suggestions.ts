import type { DomainSuggestion, FreeDomainSuggestion } from '@automattic/api-core';

export const buildFreeSuggestion = (
	suggestion: Partial< FreeDomainSuggestion > = {}
): FreeDomainSuggestion => {
	return {
		domain_name: suggestion.domain_name ?? 'example.wordpress.com',
		cost: 'Free',
		is_free: true,
	};
};

export const buildSuggestion = (
	suggestion: Partial< DomainSuggestion > = {}
): DomainSuggestion => {
	return {
		domain_name: suggestion.domain_name ?? 'example.com',
		currency_code: 'USD',
		max_reg_years: 10,
		multi_year_reg_allowed: true,
		product_id: 123,
		product_slug: 'dotcom_domain',
		raw_price: 40,
		relevance: 0.9,
		supports_privacy: true,
		vendor: 'donuts',
		cost: suggestion.cost ?? '$5',
		...suggestion,
	};
};
