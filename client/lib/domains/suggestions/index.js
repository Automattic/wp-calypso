/**
 * Get the suggestions vendor
 *
 * @param {object} [options={}] Options to control the behaviour.
 * @param {boolean} [options.isSignup=false] Whether the query is part of a signup flow.
 *
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( options = {} ) => {
	if ( options && options.isSignup ) {
		return 'variation4_front';
	}
	return 'variation2_front';
};
