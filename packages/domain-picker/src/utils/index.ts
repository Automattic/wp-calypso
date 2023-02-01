import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import type { DomainSuggestions } from '@automattic/data-stores';

export function mockDomainSuggestion(
	domainName: string | undefined
): DomainSuggestions.DomainSuggestion | undefined {
	if ( ! domainName ) {
		return undefined;
	}

	return {
		domain_name: domainName,
		relevance: 1,
		supports_privacy: true,
		vendor: '',
		cost: '',
		product_id: 0,
		product_slug: '',
		raw_price: 0,
		currency_code: '',
		unavailable: false,
	};
}

/**
 * Get the suggestions vendor
 *
 * @param {Object} [options={}] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup=false] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly=false] Flag to indicate that we're in a domain-only context
 * @param {boolean} [options.isPremium=false] Flag to show premium domains.
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
interface DomainSuggestionsVendorOptions {
	isSignup?: boolean;
	isDomainOnly?: boolean;
	isPremium?: boolean;
	flowName?: typeof NEWSLETTER_FLOW | typeof LINK_IN_BIO_FLOW;
}
type DomainSuggestionsVendor =
	| 'variation2_front'
	| 'variation4_front'
	| 'variation8_front'
	| 'link-in-bio'
	| 'newsletter';

export function getDomainSuggestionsVendor(
	options: DomainSuggestionsVendorOptions = {}
): DomainSuggestionsVendor {
	if ( options.flowName === LINK_IN_BIO_FLOW ) {
		return 'link-in-bio';
	}
	if ( options.flowName === NEWSLETTER_FLOW ) {
		return 'newsletter';
	}
	if ( options.isSignup && ! options.isDomainOnly ) {
		return 'variation4_front';
	}
	if ( options.isPremium ) {
		return 'variation8_front';
	}
	return 'variation2_front';
}
