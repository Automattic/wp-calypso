import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { decodeEntitiesFromPlugins } from './helpers';
import type { SiteId, SiteSlug } from 'calypso/types';

export type CorePlugin = {
	plugin: string;
	status: 'active' | 'inactive';
	name: string;
	plugin_uri: string;
	author: string;
	author_uri: string;
	description: string;
	version: string;
	network_only: boolean;
	requires_wp: string;
	requires_php: string;
	textdomain: string;
	is_managed?: boolean;
	_links: { self: { [ key: number ]: { href: string } } };
};

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
			_plugins = _plugins.map( ( plugin ) => ( {
				...plugin,
				plugin: plugin.plugin.endsWith( ext ) ? plugin.plugin : `${ plugin.plugin }${ ext }`,
			} ) );
		}
		return _plugins;
	};

	return useQuery< CorePluginsResponse >( {
		queryKey: [ 'core-plugins', siteIdOrSlug ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/sites/${ siteIdOrSlug }/plugins`,
				apiVersion: '2',
				apiNamespace: 'wp/v2',
			} );
		},
		meta: {
			persist: false,
		},
		enabled: !! siteIdOrSlug,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 30 * 1000, // 30 seconds
		select,
	} );
};
