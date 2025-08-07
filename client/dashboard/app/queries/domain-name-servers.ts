import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchDomainNameServers, updateDomainNameServers } from '../../data/domain-name-servers';
import { queryClient } from '../query-client';

export const domainNameServersQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'nameservers' ],
		queryFn: () => fetchDomainNameServers( domainName ),
		refetchOnWindowFocus: false,
	} );

export const domainNameServersMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( nameservers: string[] ) => updateDomainNameServers( domainName, nameservers ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainNameServersQuery( domainName ) );
		},
	} );
