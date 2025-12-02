import {
	createTitanMailbox,
	deleteTitanMailbox,
	fetchDomainMailboxAccounts,
	fetchMailboxes,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const mailboxesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'mailboxes', siteId ],
		queryFn: () => fetchMailboxes( siteId ),
	} );

export const mailboxAccountsQuery = ( siteId: number, domain: string ) =>
	queryOptions( {
		queryKey: [ 'mailboxes', siteId, domain ],
		queryFn: () => fetchDomainMailboxAccounts( siteId, domain ),
		enabled: Boolean( siteId ),
	} );

export const createTitanMailboxMutation = () => {
	return mutationOptions( {
		mutationFn: ( vars: {
			domainName: string;
			isAdmin: boolean;
			mailbox: string;
			name: string;
			password: string;
			passwordResetEmail: string;
		} ) =>
			createTitanMailbox( {
				domainName: vars.domainName,
				isAdmin: vars.isAdmin,
				mailbox: vars.mailbox,
				name: vars.name,
				password: vars.password,
				passwordResetEmail: vars.passwordResetEmail,
			} ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'mailboxes' ] } );
		},
	} );
};

export const deleteTitanMailboxMutation = () => {
	return mutationOptions( {
		mutationFn: ( vars: { domainName: string; mailbox: string } ) =>
			deleteTitanMailbox( vars.domainName, vars.mailbox ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'mailboxes' ] } );
		},
	} );
};
