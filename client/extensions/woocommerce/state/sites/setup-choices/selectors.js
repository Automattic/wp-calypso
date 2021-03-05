/**
 * External dependencies
 */

import { get, isEmpty, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getSetupChoices = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'setupChoices' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the setup choices list has been successfully loaded from the server
 */
export const areSetupChoicesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const setupChoices = getSetupChoices( state, siteId );
	return isObject( setupChoices ) && ! isEmpty( setupChoices );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the setup choices list is currently being retrieved from the server
 */
export const areSetupChoicesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getSetupChoices( state, siteId );
};

const isChoiceTrue = ( state, siteId, key ) => {
	if ( ! siteId ) {
		return false;
	}

	const setupChoices = getSetupChoices( state, siteId );
	if ( ! setupChoices ) {
		return false;
	}

	if ( 'object' !== typeof setupChoices ) {
		return false;
	}

	if ( ! ( key in setupChoices ) ) {
		return false;
	}

	return setupChoices[ key ];
};

/**
 * Gets whether the merchant has marked initial setup finished from API data.
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not initial setup was completed
 */
export function getFinishedInitialSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'finished_initial_setup' );
}

/**
 * Gets whether the merchant has opted out of shipping setup.
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not shipping setup has been opted out of
 */
export function getOptedOutOfShippingSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'opted_out_of_shipping_setup' );
}

/**
 * Gets whether the merchant has opted out of taxes setup.
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not taxes setup has been opted out of
 */
export function getOptedOutofTaxesSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'opted_out_of_taxes_setup' );
}

/**
 * Gets whether the merchant has launched the customizer from the dashboard.
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not the merchant has launched the customizer from the dashboard
 */
export function getTriedCustomizerDuringInitialSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'tried_customizer_during_initial_setup' );
}

/**
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not the local shipping zone was already automatically created
 */
export function isDefaultShippingZoneCreated( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'created_default_shipping_zone' );
}

/**
 * Gets whether or not all required plugins were installed during setup for this site
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not all required plugins were installed during setup for this site
 */
export function getFinishedInstallOfRequiredPlugins( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'finished_initial_install_of_required_plugins' );
}

/**
 * Gets whether or not store pages were created during setup for this site
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not all store pages were created during setup for this site
 */
export function getFinishedPageSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'finished_page_setup' );
}

/**
 * Gets whether the tax page was clicked through to during setup
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not all the tax page was clicked through to during setup
 */
export function getCheckedTaxSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'checked_tax_setup' );
}

/**
 * Gets whether the merchant completed setting the store address during setup
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not the merchant completed setting the store address during setup
 */
export function getSetStoreAddressDuringInitialSetup( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'set_store_address_during_initial_setup' );
}

/**
 * Determine if all setup steps are complete
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not the site has completed all setup tasks
 */
export function isStoreSetupComplete( state, siteId = getSelectedSiteId( state ) ) {
	return (
		siteId &&
		getFinishedInstallOfRequiredPlugins( state, siteId ) &&
		getFinishedPageSetup( state, siteId ) &&
		getSetStoreAddressDuringInitialSetup( state, siteId ) &&
		getFinishedInitialSetup( state, siteId )
	);
}

/**
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether or not this site is a test site.
 */
export function isTestSite( state, siteId = getSelectedSiteId( state ) ) {
	return isChoiceTrue( state, siteId, 'is_test_site' );
}
