import getSiteOption from './get-site-option';

/**
 * Returns true if site has the specified plugin (which uses a Jetpack connection) active, false if it is not active
 *
 * @param  {Object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @param  {?string}   plugin The slug of the plugin to check, defaults to Jetpack
 * @returns {?boolean}        Whether the site has the plugin active
 */
export default function isJetpackConnectionPluginActive( state, siteId, plugin = 'jetpack' ) {
	const activeJetpackPlugins = getSiteOption( state, siteId, 'jetpack_connection_active_plugins' );
	return activeJetpackPlugins && activeJetpackPlugins.includes( plugin );
}
