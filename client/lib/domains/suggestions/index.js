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

/**
 * Get the premium level to be used for suggestions.
 *
 * @param {boolean} [isSignup=false] Whether we are in the signup flow.
 *
 * @returns {number} Premium level to supply to the domain suggestions query.
 */
export const getSuggestionsPremiumLevel = ( isSignup = false ) => {
	if ( isSignup ) {
		return 0;
	}
	return config.isEnabled( 'domains/premium-domain-purchases' ) ? 1 : 0;
};
