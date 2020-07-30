/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Get the suggestions vendor
 *
 * @param {boolean} [isSignup=false] Whether the query is part of a signup flow.
 *
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( isSignup = false ) => {
	if ( isSignup ) {
		return 'variation4_front';
	}
	if ( config.isEnabled( 'domains/premium-domain-purchases' ) ) {
		return 'variation7_front';
	}
	return 'variation2_front';
};
