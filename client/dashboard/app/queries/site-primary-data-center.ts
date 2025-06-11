import { fetchPrimaryDataCenter } from '../../data/site-hosting';

export const sitePrimaryDataCenterQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'primary-data-center' ],
	queryFn: () => fetchPrimaryDataCenter( siteId ),
} );
