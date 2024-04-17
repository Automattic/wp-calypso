import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { mapToCorePlugin, mapPluginExtension, decodeEntitiesFromPlugins } from './helpers';
import type { CorePlugin, SitePlugin } from './types';

type PluginsResponse = {
	sites: {
		[ key: number ]: SitePlugin[];
	};
};

/**
 * Fetches plugins for the given site IDs.
 */
export const useSitesPluginsQuery = ( siteIds: number[] ): UseQueryResult< CorePlugin[] > => {
	const select = ( data: PluginsResponse ) => {
		// union of plugins for provided site IDs
		const plugins = Object.entries( data.sites ).reduce( ( acc: SitePlugin[], [ key, value ] ) => {
			siteIds.includes( parseInt( key ) ) && acc.push( ...value );
			return acc;
		}, [] );

		// unique list of plugins sorted by slug
		const unique = [ ...new Map( plugins.map( ( item ) => [ item.slug, item ] ) ).values() ].sort(
			( a, b ) => {
				return a.name.localeCompare( b.name );
			}
		);

		return decodeEntitiesFromPlugins( unique )
			.map( mapToCorePlugin )
			.map( ( p ) => mapPluginExtension( p as CorePlugin, '.php' ) );
	};

	return useQuery( {
		queryKey: [ 'me-sites-plugins' ],
		queryFn: () => {
			return wpcomRequest< PluginsResponse >( {
				path: `/me/sites/plugins`,
				apiVersion: '1.1',
			} );
		},
		enabled: !! siteIds.length,
		refetchOnWindowFocus: false,
		staleTime: 30 * 1000, // 30 seconds
		select,
	} );
};
