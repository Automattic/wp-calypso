/** @format */
/**
 * Internal dependencies
 */
import { isUsingGivenLocales } from 'lib/abtest';

export const getSuggestionsVendor = () => {
	if ( isUsingGivenLocales( [ 'en' ] ) ) {
		return 'variation_front';
	}

	return 'variation2_front';
};
