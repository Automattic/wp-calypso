import { fetchDomain, disconnectDomain, resendIcannVerificationEmail } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName ],
		queryFn: () => fetchDomain( domainName ),
	} );

export const disconnectDomainMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => disconnectDomain( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );

export const resendIcannVerificationEmailMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: () => resendIcannVerificationEmail( domainName ),
	} );
