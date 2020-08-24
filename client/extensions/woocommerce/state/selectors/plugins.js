/**
 * External dependencies
 */
import { every, find } from 'lodash';
/**
 * Internal dependencies
 */
import config from 'config';
import {
	getPlugins,
	isRequestingForSites,
	getPluginOnSite,
} from 'state/plugins/installed/selectors';
import { getRequiredPluginsForCalypso } from 'woocommerce/lib/get-required-plugins';
import { getSelectedSiteId } from 'state/ui/selectors';
import createSelector from 'lib/create-selector';

const getWcsPluginData = createSelector(
	( state, siteId ) => {
		const pluginData = getPluginOnSite( state, siteId, 'woocommerce-services' );
		return pluginData && pluginData.sites[ siteId ].active ? pluginData : null;
	},
	( state, siteId ) => [ state.plugins.installed.plugins[ siteId ] ]
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the given site has woocommerce services installed & active
 */
export const isWcsEnabled = ( state, siteId = getSelectedSiteId( state ) ) =>
	config.isEnabled( 'woocommerce/extension-wcservices' ) &&
	Boolean( getWcsPluginData( state, siteId ) );

const isVersionAtLeast = ( minimumVersion, pluginVersion ) => {
	const [ major, minor, patch ] = minimumVersion.split( '.' ).map( ( x ) => parseInt( x, 10 ) );
	const [ pluginMajor, pluginMinor, pluginPatch ] = pluginVersion
		.split( '.' )
		.map( ( x ) => parseInt( x, 10 ) );
	return (
		pluginMajor > major ||
		( pluginMajor === major && pluginMinor > minor ) ||
		( pluginMajor === major && pluginMinor === minor && pluginPatch >= patch )
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the given site has a version of WooCommerce Services new enough to support international labels
 */
export const isWcsInternationalLabelsEnabled = ( state, siteId = getSelectedSiteId( state ) ) =>
	isWcsEnabled( state, siteId ) &&
	config.isEnabled( 'woocommerce/extension-wcservices/international-labels' ) &&
	isVersionAtLeast( '1.16.0', getWcsPluginData( state, siteId ).version );

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean|null} Whether the given site has all required plugins installed & active
 */
export const areAllRequiredPluginsActive = ( state, siteId = getSelectedSiteId( state ) ) => {
	const siteIds = [ siteId ];

	if ( isRequestingForSites( state, siteIds ) ) {
		return null;
	}

	const requiredPlugins = getRequiredPluginsForCalypso();
	const plugins = getPlugins( state, siteIds, 'active' );

	return every( requiredPlugins, ( slug ) => !! find( plugins, { slug } ) );
};
