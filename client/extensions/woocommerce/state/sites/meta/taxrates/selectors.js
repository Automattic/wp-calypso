/**
 * External dependencies
 */
import { get, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

export const getTaxRates = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'meta', 'taxrates' ] );
};

export const areTaxRatesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isObject( getTaxRates( state, siteId ) );
};

export const areTaxRatesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getTaxRates( state, siteId );
};
