import { fetchPrimaryDataCenter } from '../../data/site-hosting';

export const sitePrimaryDataCenterQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'primary-data-center' ],
	queryFn: () => fetchPrimaryDataCenter( siteId ),
} );
