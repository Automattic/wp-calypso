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
 * @param siteIdOrSlug The site ID or slug
 */
export const useCorePluginsQuery = (
	siteIdOrSlug: SiteId | SiteSlug | undefined,
	hideManagedPlugins: boolean = false
): UseQueryResult< CorePluginsResponse > => {
	const select = ( plugins: CorePluginsResponse ) => {
		const decodedPlugins = decodeEntitiesFromPlugins( plugins );
		return hideManagedPlugins
			? decodedPlugins.filter( ( plugin ) => ! plugin.is_managed )
			: decodedPlugins;
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
		select,
	} );
};
