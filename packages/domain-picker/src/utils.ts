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
