import { queryOptions } from '@tanstack/react-query';
import { fetchSiteDomains } from '../../data/site-domains';

export const siteDomainsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'domains' ],
		queryFn: () => fetchSiteDomains( siteId ),
	} );
