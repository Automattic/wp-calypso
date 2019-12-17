/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

export const getSuggestionsVendor = ( isSignup = false ) => {
	if ( isSignup ) {
		return abtest( 'domainSuggestionsWithHints' );
	}
	return 'variation2_front';
};
