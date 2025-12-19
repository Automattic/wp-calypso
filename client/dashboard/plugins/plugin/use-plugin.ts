import { MarketplaceSearch, PluginItem, Site, SitePlugin } from '@automattic/api-core';
import {
	pluginsQuery,
	wpOrgPluginQuery,
	sitePluginQuery,
	marketplacePluginsQuery,
} from '@automattic/api-queries';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppContext } from '../../app/context';
import { useLocale } from '../../app/locale';

export interface SiteWithPluginData extends Site {
	actionLinks?: SitePlugin[ 'action_links' ];
	hasPluginUpdate?: boolean;
	isPluginActive: boolean;
	isPluginAutoupdated?: boolean;
	isPluginManaged: boolean;
}

/**
 * Search for an icon on the cached marketplace search query results for a given plugin slug.
 */
const useMarketplaceSearchIcon = ( pluginSlug: string ) => {
	const queryClient = useQueryClient();
	const marketplaceSearchPluginData = queryClient
		.getQueriesData< MarketplaceSearch >( {
			queryKey: [ 'marketplace-search' ],
			predicate: ( query ) => query.queryKey.includes( pluginSlug ),
		} )
		.flatMap( ( [ , data ] ) => data?.data.results || [] )
		.find( ( result ) => result.fields.slug === pluginSlug );

	return marketplaceSearchPluginData?.fields.plugin.icons;
};

export const usePlugin = ( pluginSlug: string ) => {
	const queryClient = useQueryClient();
	const availableIcon = useMarketplaceSearchIcon( pluginSlug );
	const { queries } = useAppContext();
	const locale = useLocale();
	const {
		data: sitesPlugins,
		isLoading: isLoadingSitesPlugins,
		isFetching: isFetchingSitePlugins,
	} = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );
	const { data: marketplacePlugins, isLoading: isLoadingMarketplacePlugins } = useQuery(
		marketplacePluginsQuery()
	);
	const isMarketplacePlugin = !! marketplacePlugins?.results[ pluginSlug ];
	const { data: wpOrgPlugin, isLoading: isLoadingWpOrgPlugin } = useQuery( {
		...wpOrgPluginQuery( pluginSlug, locale ),
		enabled: ! availableIcon,
	} );
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

	let pluginData;
	if ( pluginBySiteId.size ) {
		pluginData = pluginBySiteId.get( siteIdsWithThisPlugin[ 0 ] );
	} else if ( isMarketplacePlugin ) {
		pluginData = marketplacePlugins?.results[ pluginSlug ];
	} else if ( wpOrgPlugin ) {
		pluginData = wpOrgPlugin;
	}

	const [ sitesWithThisPlugin, sitesWithoutThisPlugin ]: [ SiteWithPluginData[], Site[] ] = sites
		? sites
				.filter( ( site ) => site.capabilities.update_plugins )
				.reduce(
					( acc, site ) => {
						if ( siteIdsWithThisPlugin.includes( site.ID ) ) {
							const plugin = pluginBySiteId.get( site.ID );

							const hasPluginUpdate = !! plugin?.update;
							const isPluginActive = plugin?.active ?? false;
							const isPluginAutoupdated = plugin?.autoupdate ?? false;
							const isPluginManaged = plugin?.is_managed ?? false;
							const actionLinks = actionLinksBySiteId.get( Number( site.ID ) ) || {
								Settings: `${ site.URL }/wp-admin/plugins.php`,
							};

							acc[ 0 ].push( {
								...site,
								hasPluginUpdate,
								isPluginActive,
								isPluginAutoupdated,
								actionLinks,
								isPluginManaged,
							} );
						} else {
							acc[ 1 ].push( site );
						}

						return acc;
					},
					[ [], [] ] as [ SiteWithPluginData[], Site[] ]
				)
		: [ [], [] ];

	let icon;
	if ( availableIcon ) {
		icon = availableIcon;
	} else if ( isMarketplacePlugin ) {
		icon = marketplacePlugins?.results[ pluginSlug ]?.icons;
	} else if ( wpOrgPlugin?.icons ) {
		if ( '1x' in wpOrgPlugin.icons ) {
			icon = wpOrgPlugin.icons[ '1x' ];
		} else if ( 'default' in wpOrgPlugin.icons ) {
			icon = wpOrgPlugin.icons.default;
		}
	}

	return {
		isLoading:
			isLoadingSitesPlugins ||
			isLoadingSites ||
			isLoadingWpOrgPlugin ||
			isLoadingMarketplacePlugins ||
			isLoadingSitePlugins,
		isFetching: isFetchingSitePlugins,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
		plugin: pluginData,
		icon,
	};
};
