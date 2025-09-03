import { fetchPrimaryDataCenter } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const sitePrimaryDataCenterQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'primary-data-center' ],
		queryFn: () => fetchPrimaryDataCenter( siteId ),
	} );
