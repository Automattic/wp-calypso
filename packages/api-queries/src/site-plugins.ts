import { fetchSiteCorePlugins, fetchSitePlugins } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const sitePluginsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plugins' ],
		queryFn: () => fetchSitePlugins( siteId ),
		retry: false,
	} );

export const siteCorePluginsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'core-plugins' ],
		queryFn: () => fetchSiteCorePlugins( siteId ),
		retry: false,
	} );
