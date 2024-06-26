import { getWPORGPluginSlugMap } from 'calypso/my-sites/checkout/checkout-thank-you/utils';
import getSiteOption from './get-site-option';

/**
 * Returns a site's wp-admin plugin page depending on which plugin is active.
 * @param   {Object}  state  Global state tree
 * @param   {?number} siteId Site ID
 * @param   {?string} productSlug the slug of the product that we want to get an admin page for
 * @returns {string}         Plugin page name if a plugin is active. Defaults to `my-jetpack`
 */
export default function getSiteAdminPage( state, siteId, productSlug ) {
	const activeConnectedPlugins =
		getSiteOption( state, siteId, 'jetpack_connection_active_plugins' ) ?? [];
	let plugins = [
		'jetpack-backup',
		'jetpack-boost',
		'jetpack-search',
		'jetpack-social',
		'jetpack-protect',
		'jetpack-videopress',
	];

	// If we have a known product slug, check for a corresponding plugin
	if ( productSlug ) {
		const wporgPluginSlug = getWPORGPluginSlugMap()[ productSlug ];
		if ( wporgPluginSlug ) {
			plugins = [ wporgPluginSlug ];
		}
	}

	return plugins.find( ( plugin ) => activeConnectedPlugins.includes( plugin ) ) ?? 'my-jetpack';
}
