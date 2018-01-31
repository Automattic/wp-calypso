/**
 * External dependencies
 *
 * @format
 */

import { get, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} Email settings.
 */
export const getEmailSettings = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'email' ], null );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the email settings have been successfully loaded from the server
 */
export const areEmailSettingsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isObject( getEmailSettings( state, siteId ) );
};

const getField = field => {
	return ( state, siteId = getSelectedSiteId( state ) ) => {
		return get(
			state,
			[ 'extensions', 'woocommerce', 'sites', siteId, 'settings', 'email', field ],
			false
		);
	};
};

/**
 * Returns true if email settings are being saved.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether user requested save action.
 */
export const isSavingEmailSettings = getField( 'save' );

/**
 * Returns true if email settings are being saved.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether user requested save action.
 */
export const emailSettingsSubmitSettingsError = getField( 'error' );
