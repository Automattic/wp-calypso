import { fetchSiteCorePlugins, fetchSitePlugins } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const sitePluginsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plugins' ],
		queryFn: () => fetchSitePlugins( siteId ),
	} );

export const siteCorePluginsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'core-plugins' ],
		queryFn: () => fetchSiteCorePlugins( siteId ),
	} );
