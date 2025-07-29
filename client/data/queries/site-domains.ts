import { fetchSiteDomains } from '../api/site-domains';

export const siteDomainsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'domains' ],
	queryFn: () => fetchSiteDomains( siteId ),
} );
