/**
 * External dependencies
 *
 */

import { get, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} Email settings.
 */
export const getEmailSettings = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'email' ], null );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the email settings have been successfully loaded from the server
 */
export const areEmailSettingsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isObject( getEmailSettings( state, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the email settings are currently being retrieved from the server
 */
export const areEmailSettingsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getEmailSettings( state, siteId );
};

const getField = ( field ) => {
	return ( state, siteId = getSelectedSiteId( state ) ) => {
		return get(
			state,
			[ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'email', field ],
			false
		);
	};
};

/**
 * Returns true if user requested save action in Email Settings.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether user requested save action.
 */
export const emailSettingsSaveRequest = getField( 'save' );

/**
 * Returns true if email settings are being saved.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether user requested save action.
 */
export const isSavingEmailSettings = getField( 'isSaving' );

/**
 * Returns true if email settings are being saved.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether user requested save action.
 */
export const emailSettingsSubmitSettingsError = getField( 'error' );
