import { fetchSiteDomains } from '../../data/site-domains';

export const siteDomainsQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteIdOrSlug, 'domains' ],
    queryFn: () => fetchSiteDomains( siteId ),
} );
