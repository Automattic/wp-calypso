import { queryOptions } from '@tanstack/react-query';
import { fetchDomainDns } from '../../data/domain-dns';

export const domainDnsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-dns' ],
		queryFn: () => fetchDomainDns( domainName ),
	} );
