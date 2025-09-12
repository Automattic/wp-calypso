import { PluginItem, Site } from '@automattic/api-core';
import {
	pluginsQuery,
	sitesQuery,
	marketplacePluginQuery,
	wpOrgPluginQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '../../app/locale';

export interface SiteWithPluginActivationStatus extends Site {
	isPluginActive: boolean;
}

export const usePlugin = ( pluginSlug: string ) => {
	const locale = useLocale();
	const { data: sitesPlugins, isLoading: isLoadingSitesPlugins } = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const { data: marketplacePlugin, isLoading: isLoadingMarketplacePlugin } = useQuery(
		marketplacePluginQuery( pluginSlug )
	);
	const { data: wpOrgPlugin, isLoading: isLoadingWpOrgPlugin } = useQuery(
		wpOrgPluginQuery( pluginSlug, locale )
	);

	const pluginBySiteId = useMemo(
		() =>
			Object.entries( sitesPlugins?.sites || {} ).reduce( ( acc, [ siteId, plugins ] ) => {
				const plugin = plugins.find( ( p ) => p.slug === pluginSlug );
				if ( plugin ) {
					acc.set( Number( siteId ), plugin );
				}
				return acc;
			}, new Map< number, PluginItem >() ),
		[ sitesPlugins, pluginSlug ]
	);

	const siteIdsWithThisPlugin = Array.from( pluginBySiteId.keys() );

	const pluginData = pluginBySiteId.size
		? pluginBySiteId.get( siteIdsWithThisPlugin[ 0 ] )
		: undefined;

	const [ sitesWithThisPlugin, sitesWithoutThisPlugin ]: [
		SiteWithPluginActivationStatus[],
		Site[],
	] = sites
		? sites.reduce(
				( acc, site ) => {
					if ( siteIdsWithThisPlugin.includes( site.ID ) ) {
						const isPluginActive = pluginBySiteId.get( site.ID )?.active ?? false;

						acc[ 0 ].push( { ...site, isPluginActive } );
					} else {
						acc[ 1 ].push( site );
					}
					return acc;
				},
				[ [], [] ] as [ SiteWithPluginActivationStatus[], Site[] ]
		  )
		: [ [], [] ];

	return {
		isLoading:
			isLoadingSitesPlugins || isLoadingSites || isLoadingWpOrgPlugin || isLoadingMarketplacePlugin,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
		plugin: pluginData,
		icons: wpOrgPlugin?.icons || marketplacePlugin?.icons,
	};
};
