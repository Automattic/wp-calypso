// eslint-disable-next-line wpcalypso/import-docblock
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
 * The domain search API will return an error for certain queries. This helper
 * pre-emptively guesses whether a given string will return an error result.
 * Useful for deciding whether a string is a good default domain query.
 *
 * @param domainQuery string to check
 */
export function isGoodDefaultDomainQuery( domainQuery: string ): boolean {
	if ( typeof domainQuery.normalize === 'undefined' ) {
		// If the browser doesn't support String.prototype.normalize then
		// play it safe and assume this isn't a safe domain query.
		return false;
	}

	return !! domainQuery
		.normalize( 'NFD' ) // Encode diacritics in a consistent way so we can remove them
		.replace( /[\u0300-\u036f]/g, '' )
		.match( /[a-z0-9-.\s]/i );
}

/**
 * Get the suggestions vendor
 *
 * @param {object} [options={}] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup=false] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly=false] Flag to indicate that we're in a domain-only context
 * @param {boolean} [options.isPremium=false] Flag to show premium domains.
 *
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
interface DomainSuggestionsVendorOptions {
	isSignup?: boolean;
	isDomainOnly?: boolean;
	isPremium?: boolean;
}
type DomainSuggestionsVendor = 'variation2_front' | 'variation4_front' | 'variation8_front';

export function getDomainSuggestionsVendor(
	options: DomainSuggestionsVendorOptions = {}
): DomainSuggestionsVendor {
	if ( options.isSignup && ! options.isDomainOnly ) {
		return 'variation4_front';
	}
	if ( options.isPremium ) {
		return 'variation8_front';
	}
	return 'variation2_front';
}
