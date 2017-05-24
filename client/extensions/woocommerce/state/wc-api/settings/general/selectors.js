/**
 * External dependencies
 */
import { find, get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from './reducer';

const getRawGeneralSettings = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'wcApi', siteId, 'settingsGeneral' ] );
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
 * @param {Number} siteId wpcom site id
 * @return {Object} Payment Currency Settings
 */
export function getPaymentCurrencySettings( state, siteId ) {
	const wcApi = state.extensions.woocommerce.wcApi || {};
	const siteData = wcApi[ siteId ] || {};
	const currency = find( siteData.settingsGeneral, ( item ) => item.id === 'woocommerce_currency' );
	return currency || {};
}
