/** @format */
/**
 * External dependencies
 */
import { every, find } from 'lodash';
/**
 * Internal dependencies
 */
import config from 'config';
import { getPlugins, isRequestingForSites } from 'state/plugins/installed/selectors';
import { getRequiredPluginsForCalypso } from 'woocommerce/lib/get-required-plugins';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean|null} Whether the given site has woocommerce services installed & active
 */
export const isWcsEnabled = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! config.isEnabled( 'woocommerce/extension-wcservices' ) ) {
		return false;
	}

	const siteIds = [ siteId ];

	if ( isRequestingForSites( state, siteIds ) ) {
		return null;
	}

	const plugins = getPlugins( state, siteIds, 'active' );
	return Boolean( find( plugins, { slug: 'woocommerce-services' } ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean|null} Whether the given site has all required plugins installed & active
 */
export const areAllRequiredPluginsActive = ( state, siteId = getSelectedSiteId( state ) ) => {
	const siteIds = [ siteId ];

	if ( isRequestingForSites( state, siteIds ) ) {
		return null;
	}

	const requiredPlugins = getRequiredPluginsForCalypso();
	const plugins = getPlugins( state, siteIds, 'active' );

	return every( requiredPlugins, slug => !! find( plugins, { slug } ) );
};
