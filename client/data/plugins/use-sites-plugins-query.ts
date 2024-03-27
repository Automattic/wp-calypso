import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteId } from 'calypso/types';

export type SitePluginsReturn = {
	name: string;
	id: string;
	slug: string;
};

export type SitePlugin = {
	active: boolean;
	author: string;
	author_url: string;
	autoupdate: boolean;
	description: string;
	display_name: string;
	name: string;
	network: boolean;
	plugin_url: string;
	slug: string;
	uninstallable: boolean;
	version: string;
};

export type SitesPluginsResponse = {
	sites: {
		[ siteId: number ]: SitePlugin[];
	};
};

/**
 * Fetches the plugins for all the user's sites
 */
export const useSitesPluginsQuery = (
	siteIds: SiteId[] = []
): UseQueryResult< SitePluginsReturn[] > => {
	return useQuery< SitesPluginsResponse, Error, SitePluginsReturn[] >( {
		queryKey: [ 'sites-plugins' ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/me/sites/plugins`,
			} );
		},
		meta: {
			persist: true,
		},
		select: ( data ): SitePluginsReturn[] => {
			// return only the plugins available in siteIds
			// map to { name, id, string } and remove duplicates
			const plugins: SitePluginsReturn[] = [];
			for ( const siteId of siteIds ) {
				if ( data.sites[ siteId ] ) {
					for ( const plugin of data.sites[ siteId ] ) {
						plugins.push( {
							name: plugin.name,
							id: plugin.id,
							slug: plugin.slug,
						} );
					}
				}
			}
			// remove duplicates
			return plugins
				.filter(
					( plugin, index, self ) => self.findIndex( ( p ) => p.slug === plugin.slug ) === index
				)
				.sort( ( a, b ) => a.name.localeCompare( b.name ) );
		},
	} );
};
