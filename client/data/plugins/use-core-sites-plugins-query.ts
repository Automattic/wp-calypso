import { useQuery, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { decodeEntitiesFromPlugins, mapPluginExtension } from 'calypso/data/plugins/helpers';
import { CorePlugin } from 'calypso/data/plugins/types';

const fetchPluginsForSite = async ( siteId: number ): Promise< CorePlugin[] > => {
	return await wpcomRequest( {
		path: `/sites/${ siteId }/plugins`,
		apiNamespace: 'wp/v2',
	} );
};

export const useCoreSitesPluginsQuery = (
	siteIds: number[],
	hideManagedPlugins = false,
	addPluginExtension = false
) => {
	const queryClient = useQueryClient();

	return useQuery( {
		queryKey: [ 'core-plugins', ...siteIds ],
		queryFn: () => {
			const promises = siteIds.map( ( siteId ) => {
				const cachedData = queryClient.getQueryData( [ 'core-plugins', siteId ] ) as CorePlugin[];

				if ( cachedData ) {
					return Promise.resolve( cachedData );
				}
				return fetchPluginsForSite( siteId );
			} );

			return (
				Promise.all( promises )
					// Parse plugin objects
					.then( ( data ) =>
						data.map( ( plugins ) => {
							if ( hideManagedPlugins ) {
								// hide managed plugins
								plugins = plugins.filter( ( plugin ) => ! plugin.is_managed );
							}

							if ( addPluginExtension ) {
								// add .php extension to plugin
								plugins = plugins.map( ( plugin ) => mapPluginExtension( plugin, '.php' ) );
							}

							return decodeEntitiesFromPlugins( plugins );
						} )
					)
					// Cache plugins data by siteId
					.then( ( data ) =>
						data.map( ( plugins, index ) => {
							queryClient.setQueryData( [ 'core-plugins', siteIds[ index ] ], plugins );
							return plugins;
						} )
					)
					// Unique list of plugins sorted by name
					.then( ( data ) => {
						return [
							...new Map( data.flat().map( ( plugin ) => [ plugin.plugin, plugin ] ) ).values(),
						].sort( ( a, b ) => {
							return a.name.localeCompare( b.name );
						} );
					} )
			);
		},
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !! siteIds.length,
	} );
};
