/**
 * Internal dependencies
 */

export const getSuggestionsVendor = ( isSignup = false ) => {
	if ( isSignup ) {
		return 'variation4_front';
	}
	return 'variation2_front';
};
