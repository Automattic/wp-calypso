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

export const getStoreLocation = ( state, siteId = getSelectedSiteId( state ) ) => {
	const address = {
		street: '',
		street2: '',
		city: '',
		state: '',
		postcode: '',
		country: '',
	};

	if ( ! areSettingsGeneralLoaded( state, siteId ) ) {
		return address;
	}

	const generalSettings = getRawGeneralSettings( state, siteId );

	const settingsMap = {
		street: 'woocommerce_store_address',
		street2: 'woocommerce_store_address_2',
		city: 'woocommerce_store_city',
		postcode: 'woocommerce_store_postcode',
		country: 'woocommerce_default_country',
	};

	for ( const addressKey in settingsMap ) {
		const setting = find( generalSettings, { id: settingsMap[ addressKey ] } );
		address[ addressKey ] = setting ? setting.value : '';
	}

	// WooCommerce uses country to hold both country and state (e.g. US:CT)
	// let's fix that here
	if ( address.country.indexOf( ':' ) ) {
		const parts = address.country.split( ':' );
		address.country = parts[ 0 ];
		address.state = parts[ 1 ];
	}

	return address;
};
