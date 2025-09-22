import { PluginItem, Site, SitePlugin, SitePluginsResponse } from '@automattic/api-core';
import {
	pluginsQuery,
	sitesQuery,
	marketplacePluginQuery,
	wpOrgPluginQuery,
	sitePluginsQuery,
} from '@automattic/api-queries';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '../../app/locale';

export interface SiteWithPluginData extends Site {
	actionLinks?: SitePlugin[ 'action_links' ];
	isPluginActive: boolean;
}

export const usePlugin = ( pluginSlug: string ) => {
	const queryClient = useQueryClient();
	const locale = useLocale();
	const {
		data: sitesPlugins,
		isLoading: isLoadingSitesPlugins,
		isFetching: isFetchingSitePlugins,
	} = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const { data: marketplacePlugin, isLoading: isLoadingMarketplacePlugin } = useQuery(
		marketplacePluginQuery( pluginSlug )
	);
	const { data: wpOrgPlugin, isLoading: isLoadingWpOrgPlugin } = useQuery(
		wpOrgPluginQuery( pluginSlug, locale )
	);
	// Query needed to get the action_links
	const sitePluginsQueryResults = useQueries( {
		queries: Object.keys( sitesPlugins?.sites || {} ).map( ( id ) => ( {
			...sitePluginsQuery( Number( id ) ),
		} ) ),
	} );
	const isLoadingSitePlugins = sitePluginsQueryResults.some( ( query ) => query.isLoading );

	const pluginActionLinksBySiteId = Object.keys( sitesPlugins?.sites || {} ).reduce(
		( acc, siteId ) => {
			const { queryKey } = sitePluginsQuery( Number( siteId ) );
			const data: SitePluginsResponse | undefined = queryClient.getQueryData( queryKey );

			const actionLinksByPluginSlug = ( data?.plugins || [] ).reduce<
				Map< string, SitePlugin[ 'action_links' ] >
			>( ( acc, plugin: SitePlugin ) => {
				acc.set( plugin.slug, plugin.action_links );
				return acc;
			}, new Map< string, SitePlugin[ 'action_links' ] >() );

			acc.set( Number( siteId ), actionLinksByPluginSlug );

			return acc;
		},
		new Map< number, Map< string, SitePlugin[ 'action_links' ] > >()
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

	const [ sitesWithThisPlugin, sitesWithoutThisPlugin ]: [ SiteWithPluginData[], Site[] ] = sites
		? sites.reduce(
				( acc, site ) => {
					if ( siteIdsWithThisPlugin.includes( site.ID ) ) {
						const isPluginActive = pluginBySiteId.get( site.ID )?.active ?? false;
						const actionLinks = pluginActionLinksBySiteId
							.get( Number( site.ID ) )
							?.get( pluginSlug );

						acc[ 0 ].push( { ...site, isPluginActive, actionLinks } );
					} else {
						acc[ 1 ].push( site );
					}

					return acc;
				},
				[ [], [] ] as [ SiteWithPluginData[], Site[] ]
		  )
		: [ [], [] ];

	return {
		isLoading:
			isLoadingSitesPlugins ||
			isLoadingSites ||
			isLoadingWpOrgPlugin ||
			isLoadingMarketplacePlugin ||
			isLoadingSitePlugins,
		isFetching: isFetchingSitePlugins,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
		plugin: pluginData,
		icons: wpOrgPlugin?.icons || marketplacePlugin?.icons,
	};
};
