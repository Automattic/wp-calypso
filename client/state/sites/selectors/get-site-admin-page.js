import getSiteOption from './get-site-option';

/**
 * Returns a site's wp-admin plugin page depending on which plugin is active.
 * @param  {Object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @returns {string}        Plugin page name if a plugin is active. Defaults to `my-jetpack`
 */
export default function getSiteAdminPage( state, siteId ) {
	const activeConnectedPlugins =
		getSiteOption( state, siteId, 'jetpack_connection_active_plugins' ) ?? [];
	const plugins = [ 'jetpack', 'jetpack-backup', 'jetpack-search', 'jetpack-social' ];

	return plugins.find( ( plugin ) => activeConnectedPlugins.includes( plugin ) ) ?? 'my-jetpack';
}
