import {
	fetchDomainNameServers,
	updateDomainNameServers,
	DomainNameServersResponse,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainNameServersQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'nameservers' ],
		queryFn: () => fetchDomainNameServers( domainName ),
	} );

export const domainNameServersMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( nameServers: string[] ) => updateDomainNameServers( domainName, nameServers ),
		onSuccess: ( _, data ) => {
			const oldData = queryClient.getQueryData( domainNameServersQuery( domainName ).queryKey ) as
				| DomainNameServersResponse
				| undefined;
			// optimistically update the query data
			queryClient.setQueryData( domainNameServersQuery( domainName ).queryKey, {
				isUsingDefaultNameServers: oldData?.isUsingDefaultNameServers ?? false,
				nameServers: data,
			} );
			queryClient.invalidateQueries( domainNameServersQuery( domainName ) );
		},
	} );
