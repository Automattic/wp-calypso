import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom from 'calypso/lib/wp';

const useWPV2APIEndpoint = isA8CForAgencies();
const wpV2APINamespace = 'wp/v2';

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

	// Create handlers for all plugin methods with wp/v2 namespace.
	const methods = [
		'get',
		'update',
		'updateVersion',
		'install',
		'delete',
		'enableAutoupdate',
		'disableAutoupdate',
	];

	type PluginHandlers = {
		[ key in ( typeof methods )[ number ] ]?: (
			query: Record< string, unknown >,
			...args: unknown[]
		) => unknown;
	} & {
		activate?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
		deactivate?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
	};

	const handlers: PluginHandlers = methods.reduce< PluginHandlers >( ( acc, method ) => {
		acc[ method ] = ( query, ...args ) =>
			pluginHandler[ method ]( { ...query, apiNamespace: wpV2APINamespace }, ...args );
		return acc;
	}, {} );

	// Custom methods for wp/v2 requiring different payloads.
	handlers.activate = ( query, ...args ) =>
		pluginHandler.update(
			{ ...query, apiNamespace: wpV2APINamespace },
			{ status: 'active' },
			...args
		);

	handlers.deactivate = ( query, ...args ) =>
		pluginHandler.update(
			{ ...query, apiNamespace: wpV2APINamespace },
			{ status: 'inactive' },
			...args
		);

	return handlers;
};

export const getSitePluginsHandler = ( siteId: number ) => {
	const siteHandler = wpcom.site( siteId );
	return siteHandler.pluginsList( {
		...( useWPV2APIEndpoint && { apiNamespace: wpV2APINamespace } ),
	} );
};
