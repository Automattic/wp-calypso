/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

/**
 * Get the suggestions vendor
 *
 * @param {boolean} [isSignup=false] Whether the query is part of a signup flow.
 * @param {string|null} [countryCodeForABTests=null] The country code to be used for A/B tests.
 *
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( isSignup = false, countryCodeForABTests = null ) => {
	if ( isSignup ) {
		let vendor = 'variation4_front';
		if (
			countryCodeForABTests &&
			abtest( 'domainShowJPResultsInJapan', countryCodeForABTests ) === 'variantShowJPResults'
		) {
			vendor = 'variation6_front';
		}
		return vendor;
	}
	return 'variation2_front';
};
