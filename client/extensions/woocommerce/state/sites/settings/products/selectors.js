/**
 * External dependencies
 */

import { find, get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getRawProductsSettings = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'products' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the products settings list has been successfully loaded from the server
 */
export const areSettingsProductsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawProductsSettings( state, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the products settings list is currently being retrieved from the server
 */
export const areSettingsProductsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawProductsSettings( state, siteId );
};

/**
 * Gets weight unit setting from API data.
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {object} Weight unit setting.
 */
export function getWeightUnitSetting( state, siteId = getSelectedSiteId( state ) ) {
	const productsSettings = getRawProductsSettings( state, siteId );
	const unit = find( productsSettings, ( item ) => item.id === 'woocommerce_weight_unit' );
	return unit || {};
}

/**
 * Gets dimensions unit setting from API data.
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {object} Dimensions unit setting.
 */
export function getDimensionsUnitSetting( state, siteId = getSelectedSiteId( state ) ) {
	const productsSettings = getRawProductsSettings( state, siteId );
	const unit = find( productsSettings, ( item ) => item.id === 'woocommerce_dimension_unit' );
	return unit || {};
}

/**
 * Gets an arbitrary product setting value from API data.
 *
 * @param {object} state Global state tree
 * @param {string} id setting name / id of the products setting you would like the value of
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {mixed} value for the products setting returned from the API
 */
export function getProductsSettingValue( state, id, siteId = getSelectedSiteId( state ) ) {
	const productsSettings = getRawProductsSettings( state, siteId );
	const setting = find( productsSettings, ( item ) => item.id === id );
	return setting ? setting.value : null;
}
