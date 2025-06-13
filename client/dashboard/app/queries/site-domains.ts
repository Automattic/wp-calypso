import { fetchSiteDomains } from '../../data/site-domains';

export const siteDomainsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'domains' ],
	queryFn: () => fetchSiteDomains( siteId ),
} );
