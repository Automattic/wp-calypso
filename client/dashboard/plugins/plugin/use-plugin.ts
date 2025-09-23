import { PluginItem, Site, SitePlugin } from '@automattic/api-core';
import {
	pluginsQuery,
	sitesQuery,
	marketplacePluginQuery,
	wpOrgPluginQuery,
	sitePluginQuery,
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
	const sitePluginQueryResults = useQueries( {
		queries: Object.keys( sitesPlugins?.sites || {} ).map( ( id ) =>
			sitePluginQuery( Number( id ), pluginSlug )
		),
	} );
	const isLoadingSitePlugins = sitePluginQueryResults.some( ( query ) => query.isLoading );

	const actionLinksBySiteId = Object.keys( sitesPlugins?.sites || {} ).reduce( ( acc, siteId ) => {
		const { queryKey } = sitePluginQuery( Number( siteId ), pluginSlug );
		const data: SitePlugin | undefined = queryClient.getQueryData( queryKey );

		acc.set( Number( siteId ), data?.action_links );

		return acc;
	}, new Map< number, SitePlugin[ 'action_links' ] >() );

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
						const actionLinks = actionLinksBySiteId.get( Number( site.ID ) ) || {
							Settings: `${ site.URL }/wp-admin/plugins.php`,
						};

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
