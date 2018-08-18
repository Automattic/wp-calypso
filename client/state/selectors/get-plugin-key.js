/** @format */

/**
 * External dependencies
 */
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPluginsForSite } from 'state/plugins/premium/selectors';

export default function getPluginKey( state, siteId, pluginSlug ) {
	const sitePlugins = getPluginsForSite( state, siteId, pluginSlug );
	const plugin = find( sitePlugins, [ [ 'slug' ], pluginSlug ] );
	return get( plugin, [ 'key' ], null );
}
