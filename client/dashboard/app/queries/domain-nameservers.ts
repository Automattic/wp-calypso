import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchDomainNameservers, updateDomainNameservers } from '../../data/domain-nameservers';
import { queryClient } from '../query-client';

export const domainNameserversQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'nameservers' ],
		queryFn: () => fetchDomainNameservers( domainName ),
		refetchOnWindowFocus: false,
	} );

export const domainNameserversUpdateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( nameservers: string[] ) => updateDomainNameservers( domainName, nameservers ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainNameserversQuery( domainName ) );
		},
	} );
