/**
 * External dependencies
 */
import { find, get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getRawGeneralSettings = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'general' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the general settings list has been successfully loaded from the server
 */
export const areSettingsGeneralLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawGeneralSettings( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the general settings list is currently being retrieved from the server
 */
export const areSettingsGeneralLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawGeneralSettings( state, siteId );
};

/**
 * Gets payment currency from API data.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Payment Currency Settings
 */
export function getPaymentCurrencySettings( state, siteId = getSelectedSiteId( state ) ) {
	const generalSettings = getRawGeneralSettings( state, siteId );
	const currency = find( generalSettings, ( item ) => item.id === 'woocommerce_currency' );
	return currency || {};
}
