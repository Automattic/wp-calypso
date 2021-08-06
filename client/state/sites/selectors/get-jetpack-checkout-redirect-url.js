/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';

/**
 * Returns a site's wp-admin plugin page depending on which plugin is active.
 *
 * @param  {object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @returns {string}        Jetpack or standalone plugin checkout redirect page
 */
export default function getJetpackCheckoutRedirectUrl( state, siteId ) {
	const activeConnectedPlugins = getSiteOption(
		state,
		siteId,
		'jetpack_connection_active_plugins'
	);

	const redirectMap = {
		jetpack: 'admin.php?page=jetpack#/recommendations',
		'jetpack-backup': 'admin.php?page=jetpack-backup',
	};

	// Higher values are prioritized
	let priority = {
		jetpack: 1,
		'jetpack-backup': 0,
	};

	let bestMatchingPlugin = null;

	if ( activeConnectedPlugins ) {
		activeConnectedPlugins.forEach( ( plugin ) => {
			if ( redirectMap[ plugin ] ) {
				if ( ! bestMatchingPlugin || priority[ plugin ] > priority[ bestMatchingPlugin ] ) {
					bestMatchingPlugin = plugin;
				}
			}
		} );
	}

	return bestMatchingPlugin ? redirectMap[ bestMatchingPlugin ] : null;
}
