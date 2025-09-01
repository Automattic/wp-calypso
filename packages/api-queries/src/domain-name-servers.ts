import { fetchDomainNameServers, updateDomainNameServers } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainNameServersQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'nameservers' ],
		queryFn: () => fetchDomainNameServers( domainName ),
	} );

export const domainNameServersMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( {
			nameServers,
		}: {
			nameServers: string[];
			isUsingDefaultNameServers: boolean;
		} ) => updateDomainNameServers( domainName, nameServers ),
		onSuccess: ( _, data ) => {
			// optimistically update the query data
			queryClient.setQueryData( domainNameServersQuery( domainName ).queryKey, data );
			queryClient.invalidateQueries( domainNameServersQuery( domainName ) );
		},
	} );
