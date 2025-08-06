import { queryOptions } from '@tanstack/react-query';
import { fetchDomainForwarding } from '../../data/domain-forwarding';

export const domainForwardingQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domain-forwarding', domainName ],
		queryFn: () => fetchDomainForwarding( domainName ),
	} );
