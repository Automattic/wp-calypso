/** @format */
/**
 * Internal dependencies
 */
import { abtest, isUsingGivenLocales } from 'lib/abtest';

export const getSuggestionsVendor = () => {
	if ( isUsingGivenLocales( [ 'en' ] ) ) {
		return 'variation_front';
	}

	return abtest( 'krackenM5NonEnDomainSuggestions' );
};
