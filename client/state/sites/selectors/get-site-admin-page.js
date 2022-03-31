import getSiteOption from './get-site-option';

/**
 * Returns a site's wp-admin plugin page depending on which plugin is active.
 *
 * @param  {object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @returns {string}        Jetpack or standalone plugin page name
 */
export default function getSiteAdminPage( state, siteId ) {
	const activeConnectedPlugins = getSiteOption(
		state,
		siteId,
		'jetpack_connection_active_plugins'
	);

	let pluginPage = 'jetpack';
	if ( Array.isArray( activeConnectedPlugins ) && ! activeConnectedPlugins.includes( 'jetpack' ) ) {
		if ( activeConnectedPlugins.includes( 'jetpack-backup' ) ) {
			pluginPage = 'jetpack-backup';
		} else if ( activeConnectedPlugins.includes( 'jetpack-search' ) ) {
			pluginPage = 'jetpack-search';
		}
	}
	return pluginPage;
}
