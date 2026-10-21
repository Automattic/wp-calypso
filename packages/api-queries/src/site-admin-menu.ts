import { fetchSiteAdminMenu } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteAdminMenuQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'admin-menu' ],
		queryFn: () => fetchSiteAdminMenu( siteId ),
		staleTime: 5 * 60 * 1000,
	} );
