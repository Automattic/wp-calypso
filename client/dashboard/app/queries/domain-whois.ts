import { queryOptions } from '@tanstack/react-query';
import { fetchDomainWhois } from '../../data/domain-whois';

export const domainWhoisQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois' ],
		queryFn: () => fetchDomainWhois( domainName ),
	} );
