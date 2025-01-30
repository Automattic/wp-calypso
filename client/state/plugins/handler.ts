import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom from 'calypso/lib/wp';

const useWPV2APIEndpoint = isA8CForAgencies();
const wpV2APINamespace = 'wp/v2';

// Create handlers for all plugin methods with wp/v2 namespace.
const methods = [ 'updateVersion', 'enableAutoupdate', 'disableAutoupdate' ];

type PluginHandlers = {
	[ key in ( typeof methods )[ number ] ]?: (
		query: Record< string, unknown >,
		...args: unknown[]
	) => unknown;
} & {
	get?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
	update?: (
		query: Record< string, unknown >,
		body: Record< string, unknown >,
		...args: unknown[]
	) => unknown;
	install?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
	delete?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
	activate?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
	deactivate?: ( query: Record< string, unknown >, ...args: unknown[] ) => unknown;
};

export const getPluginHandler = ( siteId: number, pluginId: string ) => {
	const pluginHandler = wpcom.site( siteId ).plugin( pluginId );
	if ( ! useWPV2APIEndpoint ) {
		return pluginHandler;
	}

	const handlers: PluginHandlers = methods.reduce< PluginHandlers >(
		( acc, method ) => ( {
			...acc,
			[ method ]: ( query, ...args ) => pluginHandler[ method ]( { ...query }, ...args ),
		} ),
		{}
	);

	// For wp/v2 we need to override the encoded pluginId otherwise the plugin will not be found.
	const pluginPath = pluginHandler.pluginPath.replace( encodeURIComponent( pluginId ), pluginId );

	// Custom methods for wp/v2 requiring different payloads.
	handlers.get = ( query, ...args ) =>
		pluginHandler.wpcom.req.get(
			pluginPath,
			{ ...query, apiNamespace: wpV2APINamespace },
			...args
		);

	handlers.update = ( query, body, ...args ) =>
		pluginHandler.wpcom.req.post(
			pluginPath,
			{ ...query, apiNamespace: wpV2APINamespace },
			body,
			...args
		);

	handlers.activate = ( query, ...args ) =>
		handlers.update?.(
			query,
			{
				status: 'active',
			},
			...args
		);

	handlers.deactivate = ( query, ...args ) =>
		handlers.update?.(
			query,
			{
				status: 'inactive',
			},
			...args
		);

	handlers.install = ( query, ...args ) => {
		// The pluginId can be a plugin's basename (e.g., woocommerce/woocommerce).
		// WordPress core expects the plugin's WordPress.org slug for installations.
		let pluginSlug = pluginId;
		if ( pluginId.includes( '/' ) ) {
			pluginSlug = pluginId.split( '/' )[ 0 ];
		}

		return pluginHandler.wpcom.req.post(
			`/sites/${ siteId }/plugins`,
			{ ...query, apiNamespace: wpV2APINamespace },
			{ slug: pluginSlug },
			...args
		);
	};

	handlers.delete = ( query, ...args ) =>
		pluginHandler.wpcom.req.post(
			{ path: pluginPath, method: 'delete' },
			{ ...query, apiNamespace: wpV2APINamespace },
			null,
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
