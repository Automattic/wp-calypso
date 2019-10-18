/** @format */
/**
 * Internal dependencies
 */
import { abtest, isUsingGivenLocales } from 'lib/abtest';

export const getSuggestionsVendor = () => {
	if ( isUsingGivenLocales( [ 'en' ] ) ) {
		if ( abtest( 'domainSuggestionsEn' ) === 'test' ) {
			return 'variation2_front';
		}

		return 'variation_front';
	}

	return 'variation2_front';
};
