/**
 * External dependencies
 */
import type { DomainSuggestion } from '@automattic/data-stores/src/domain-suggestions';

export const MOCK_DOMAIN_SUGGESTION: DomainSuggestion = {
	domain_name: 'example.com',
	cost: '€15.00',
	raw_price: 15,
	currency_code: 'EUR',
	relevance: 0.5,
};
