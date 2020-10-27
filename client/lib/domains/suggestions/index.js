/**
 * Internal dependencies
 */
import config from 'calypso/config';

/**
 * Get the suggestions vendor
 *
 * @param {object} [options={}] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup=false] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly=false] Flag to indicate that we're in a domain-only context
 *
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( options = {} ) => {
	if ( options?.isSignup && ! options?.isDomainOnly ) {
		return 'variation4_front';
	}
	if ( config.isEnabled( 'domains/premium-domain-purchases' ) ) {
		return 'variation7_front';
	}
	return 'variation2_front';
};
