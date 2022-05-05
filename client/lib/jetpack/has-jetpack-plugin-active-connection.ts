import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

type Site = {
	options?: {
		jetpack_connection_active_plugins?: Array< string >;
	};
};

/**
 * Returns true if the site has Jetpack, or a valid Jetpack product plugin with an active connection.
 * It checks the `jetpack_connection_active_plugins` option. If that is missing then it is assumed
 * to be a WPCOM simple site, which will have a valid Jetpack connection.
 *
 * @param   {Site}    site Site object that optionally includes the properties regarding active connections.
 * @returns {boolean}      Whether the site has a valid plugin with an active connection.
 */
export default function hasJetpackPluginActiveConnection( site: Site ): boolean {
	const activeJetpackPlugins = site?.options?.jetpack_connection_active_plugins;
	const plugins = [ 'jetpack' ].concat(
		isJetpackCloud() ? [ 'jetpack-search', 'jetpack-backup', 'jetpack-social' ] : []
	);
	return (
		! activeJetpackPlugins ||
		activeJetpackPlugins.some( ( plugin: string ) => plugins.includes( plugin ) )
	);
}
