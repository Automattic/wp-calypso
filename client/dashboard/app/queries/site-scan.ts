import { queryOptions } from '@tanstack/react-query';
import { fetchSiteScan } from '../../data/site-scan';

export const siteScanQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scan' ],
		queryFn: () => fetchSiteScan( siteId ),
	} );
