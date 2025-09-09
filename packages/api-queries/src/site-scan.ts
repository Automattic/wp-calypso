import { fetchSiteScan } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteScanQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scan' ],
		queryFn: () => fetchSiteScan( siteId ),
	} );
