/**
 * External dependencies
 */
import { find, get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getRawTaxSettings = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'tax' ] );
};

export const areTaxSettingsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawTaxSettings( state, siteId ) );
};

export const areTaxSettingsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawTaxSettings( state, siteId );
};

export function getPricesIncludeTax( state, siteId = getSelectedSiteId( state ) ) {
	const taxSettings = getRawTaxSettings( state, siteId );
	const pricesIncludeTax = find( taxSettings, { id: 'woocommerce_prices_include_tax' } );
	return ( 'yes' === pricesIncludeTax );
}

export function getShippingIsTaxFree( state, siteId = getSelectedSiteId( state ) ) {
	const taxSettings = getRawTaxSettings( state, siteId );
	const shippingIsTaxFree = find( taxSettings, { id: 'woocommerce_shipping_tax_class' } );
	return ( 'zero-rate' === shippingIsTaxFree );
}
