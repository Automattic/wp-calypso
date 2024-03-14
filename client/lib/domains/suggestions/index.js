import { getDomainSuggestionsVendor } from '@automattic/domain-picker';

/**
 * Get the suggestions vendor
 * @param {Object} [options] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly] Flag to indicate that we're in a domain-only context
 * @param {boolean} [options.isPremium] Flag to show premium domains.
 * @param {string} [options.flowName] The flow name (used to determine the vender).
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( options = {} ) => {
	// If the isPremium prop is not given, fallback to true.
	if ( typeof options.isPremium === 'undefined' ) {
		options.isPremium = true;
	}

	return getDomainSuggestionsVendor( options );
};
