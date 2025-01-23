import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom from 'calypso/lib/wp';

const useWPV2APIEndpoint = isA8CForAgencies();

export const getPluginHandler = ( siteId: number, pluginId: number ) => {
	const pluginHandler = wpcom.site( siteId ).plugin( pluginId );
	if ( ! useWPV2APIEndpoint ) {
		return pluginHandler;
	}
	// For wp/v2 we need to override the encoded pluginId otherwise the plugin will not be found.
	pluginHandler.pluginPath = pluginHandler.pluginPath.replace(
		encodeURIComponent( pluginId ),
		pluginId
	);
	pluginHandler._slug = pluginId;
	// Other logic as per your POC
};

export const getSitePluginsHandler = ( siteId: number ) => {
	const siteHandler = wpcom.site( siteId );
	return siteHandler.pluginsList( {
		...( useWPV2APIEndpoint && { apiNamespace: 'wp/v2' } ),
	} );
};
