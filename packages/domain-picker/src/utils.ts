// eslint-disable-next-line wpcalypso/import-docblock
import type { DomainSuggestions } from '@automattic/data-stores';

export function mockDomainSuggestion( domainName: string ): DomainSuggestions.DomainSuggestion {
	return {
		domain_name: domainName,
		relevance: 1,
		supports_privacy: true,
		vendor: '',
		cost: '',
		product_id: 0,
		product_slug: '',
	};
}
