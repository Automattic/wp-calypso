/**
 * External dependencies
 *
 * @format
 */

import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

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
	return isArray( getEmailSettings( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the email settings are currently being retrieved from the server
 */
export const areEmailSettingsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getEmailSettings( state, siteId );
};
