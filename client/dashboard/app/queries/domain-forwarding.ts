import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchDomainForwarding, deleteDomainForwarding } from '../../data/domain-forwarding';
import { queryClient } from '../query-client';

export const domainForwardingQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-forwarding' ],
		queryFn: () => fetchDomainForwarding( domainName ),
	} );

export const domainForwardingDeleteMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( forwardingId: number ) => deleteDomainForwarding( domainName, forwardingId ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainForwardingQuery( domainName ) );
		},
	} );
