import { fetchSiteAdminBar } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteAdminBarQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'admin-bar' ],
		queryFn: () => fetchSiteAdminBar( siteId ),
	} );
