import {
	fetchDomain,
	disconnectDomain,
	resendIcannVerificationEmail,
	resendVerifyEmailForward,
	deleteEmailForward,
	updateEmailForward,
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
		meta: { statId: 'domain-disconnect' },
		mutationFn: () => disconnectDomain( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domainName ) );
		},
	} );

export const resendIcannVerificationEmailMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-icann-verify-resend' },
		mutationFn: () => resendIcannVerificationEmail( domainName ),
	} );

export const resendVerifyEmailForwardMutation = () => {
	return mutationOptions( {
		meta: { statId: 'email-fwd-verify-resend' },
		mutationFn: ( vars: { domainName: string; mailbox: string; destination: string } ) =>
			resendVerifyEmailForward( vars.domainName, vars.mailbox, vars.destination ),
	} );
};

export const deleteEmailForwardMutation = () => {
	return mutationOptions( {
		meta: { statId: 'email-fwd-delete' },
		mutationFn: ( vars: { domainName: string; mailbox: string; destination: string } ) =>
			deleteEmailForward( vars.domainName, vars.mailbox, vars.destination ),
		onSuccess: () => {
			queryClient.invalidateQueries( userMailboxesQuery() );
		},
	} );
};

export const updateEmailForwardMutation = () => {
	return mutationOptions( {
		meta: { statId: 'email-fwd-update' },
		mutationFn: ( vars: {
			domainName: string;
			mailbox: string;
			destination: string;
			newDestination: string;
		} ) =>
			updateEmailForward( vars.domainName, vars.mailbox, vars.destination, vars.newDestination ),
		onSuccess: () => {
			queryClient.invalidateQueries( userMailboxesQuery() );
		},
	} );
};
