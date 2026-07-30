import {
	createTitanMailbox,
	deleteTitanMailbox,
	fetchDomainMailboxAccounts,
	fetchMailboxes,
	fetchTitanControlPanelAutoLoginUrl,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { userMailboxesQuery } from './me-mailboxes';
import { queryClient } from './query-client';
import type { TitanControlPanelContext } from '@automattic/api-core';

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
		meta: { statId: 'titan-mailbox-create' },
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
			queryClient.resetQueries( userMailboxesQuery() );
		},
	} );
};

/**
 * Modelled as a mutation rather than a query because the returned URL carries a
 * short-lived, single-use login token that must never be served from cache.
 */
export const titanControlPanelAutoLoginUrlMutation = () => {
	return mutationOptions( {
		meta: { statId: 'titan-cpanel-url-fetch' },
		mutationFn: ( vars: { orderId: number; context?: TitanControlPanelContext } ) =>
			fetchTitanControlPanelAutoLoginUrl( vars.orderId, vars.context ),
	} );
};

export const deleteTitanMailboxMutation = () => {
	return mutationOptions( {
		meta: { statId: 'titan-mailbox-delete' },
		mutationFn: ( vars: { domainName: string; mailbox: string } ) =>
			deleteTitanMailbox( vars.domainName, vars.mailbox ),
		onSuccess: () => {
			queryClient.resetQueries( userMailboxesQuery() );
		},
	} );
};
