import { queryOptions } from '@tanstack/react-query';
import { fetchPrimaryDataCenter } from '../../data/site-hosting';

export const sitePrimaryDataCenterQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'primary-data-center' ],
		queryFn: () => fetchPrimaryDataCenter( siteId ),
	} );
