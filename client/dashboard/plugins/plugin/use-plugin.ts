import { PluginItem, Site } from '@automattic/api-core';
import {
	wpOrgPluginQuery,
	pluginsQuery,
	sitesQuery,
	wpComPluginQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '../../app/locale';

export const usePlugin = ( pluginId: string ) => {
	const locale = useLocale();
	const { data: sitesPlugins, isLoading: isLoadingSitesPlugins } = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const { data: wpOrgPlugin, isLoading: isLoadingWpOrgPlugin } = useQuery(
		wpOrgPluginQuery( pluginId, locale )
	);
	const { data: wpComPlugin, isLoading: isLoadingWpComPlugin } = useQuery(
		wpComPluginQuery( pluginId )
	);

	const pluginBySiteId = useMemo(
		() =>
			Object.entries( sitesPlugins?.sites || {} ).reduce( ( acc, [ siteId, plugins ] ) => {
				const plugin = plugins.find( ( p ) => p.slug === pluginId );
				if ( plugin ) {
					acc.set( Number( siteId ), plugin );
				}
				return acc;
			}, new Map< number, PluginItem >() ),
		[ sitesPlugins, pluginId ]
	);

	const siteIdsWithThisPlugin = Array.from( pluginBySiteId.keys() );

	const pluginData = pluginBySiteId.size
		? pluginBySiteId.get( siteIdsWithThisPlugin[ 0 ] )
		: undefined;

	const [ sitesWithThisPlugin, sitesWithoutThisPlugin ] = sites
		? sites.reduce(
				( acc, site ) => {
					if ( siteIdsWithThisPlugin.includes( site.ID ) ) {
						acc[ 0 ].push( site );
					} else {
						acc[ 1 ].push( site );
					}
					return acc;
				},
				[ [], [] ] as [ Site[], Site[] ]
		  )
		: [ [], [] ];

	return {
		isLoading:
			isLoadingSitesPlugins || isLoadingSites || isLoadingWpOrgPlugin || isLoadingWpComPlugin,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
		plugin: wpOrgPlugin || wpComPlugin || pluginData,
	};
};
