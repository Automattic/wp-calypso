import { queryOptions, mutationOptions } from '@tanstack/react-query';
import {
	fetchDomainForwarding,
	deleteDomainForwarding,
	saveDomainForwarding,
	type DomainForwardingSaveData,
} from '../../data/domain-forwarding';
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

export const domainForwardingSaveMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( data: DomainForwardingSaveData ) => saveDomainForwarding( domainName, data ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainForwardingQuery( domainName ) );
		},
	} );
