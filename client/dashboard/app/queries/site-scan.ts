import { fetchSiteScan } from '../../data/site-scan';

export const siteScanQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'scan' ],
	queryFn: () => fetchSiteScan( siteId ),
} );
