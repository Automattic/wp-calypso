/**
 * External dependencies
 */

import { get, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

export const getTaxRates = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'meta', 'taxrates' ] );
};

export const areTaxRatesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const taxRates = getTaxRates( state, siteId );
	if ( ! isObject( taxRates ) ) {
		return false;
	}
	// combined_rate is present in all well formed responses
	return 'combined_rate' in taxRates;
};

export const areTaxRatesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getTaxRates( state, siteId );
};
