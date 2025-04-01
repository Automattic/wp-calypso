import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { decodeEntitiesFromPlugins, mapPluginExtension } from './helpers';
import type { CorePlugin } from './types';
import type { SiteId, SiteSlug } from 'calypso/types';

export type CorePluginsResponse = CorePlugin[];

/**
 * Fetches the plugins for a given site
 */
export const useCorePluginsQuery = (
	siteIdOrSlug: SiteId | SiteSlug | undefined,
	hideManagedPlugins = false,
	addPluginExtension = false
): UseQueryResult< CorePluginsResponse > => {
	const select = ( plugins: CorePluginsResponse ) => {
		const ext = '.php';
		let _plugins = decodeEntitiesFromPlugins( plugins );

		if ( hideManagedPlugins ) {
			_plugins = _plugins.filter( ( plugin ) => ! plugin.is_managed );
		}

		if ( addPluginExtension ) {
			_plugins = _plugins.map( ( plugin ) => mapPluginExtension( plugin, ext ) );
		}

		return _plugins;
	};

	return useQuery< CorePluginsResponse >( {
		queryKey: [ 'core-plugins', siteIdOrSlug ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/sites/${ siteIdOrSlug }/plugins`,
				apiNamespace: 'wp/v2',
			} );
		},
		enabled: !! siteIdOrSlug,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 30 * 1000, // 30 seconds
		select,
	} );
};
