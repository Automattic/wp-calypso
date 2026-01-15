import {
	fetchDomain,
	disconnectDomain,
	resendIcannVerificationEmail,
	resendVerifyEmailForward,
	deleteEmailForward,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { userMailboxesQuery } from './me-mailboxes';
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

export const resendVerifyEmailForwardMutation = () => {
	return mutationOptions( {
		mutationFn: ( vars: { domainName: string; mailbox: string; destination: string } ) =>
			resendVerifyEmailForward( vars.domainName, vars.mailbox, vars.destination ),
	} );
};

export const deleteEmailForwardMutation = () => {
	return mutationOptions( {
		mutationFn: ( vars: { domainName: string; mailbox: string; destination: string } ) =>
			deleteEmailForward( vars.domainName, vars.mailbox, vars.destination ),
		onSuccess: () => {
			queryClient.resetQueries( userMailboxesQuery() );
		},
	} );
};
