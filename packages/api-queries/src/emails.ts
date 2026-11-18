import {
	createTitanMailbox,
	deleteTitanMailbox,
	fetchDomainMailboxAccounts,
	fetchMailboxes,
	fetchTitanControlPanelAutoLoginUrl,
	fetchTitanDkimRecord,
	fetchTitanDkimStatus,
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

/**
 * Titan issues the DKIM key once and returns the same one on every call, but each
 * fetch still reaches Titan, so the record is never refetched while cached.
 */
export const titanDkimRecordQuery = ( domain: string ) =>
	queryOptions( {
		queryKey: [ 'titan-dkim-record', domain ],
		queryFn: () => fetchTitanDkimRecord( domain ),
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		retry: false,
	} );

/**
 * Reads the server's cached DKIM checks. A domain without a cached result comes back as
 * `unknown` while the server checks it in the background.
 */
export const titanDkimStatusQuery = () =>
	queryOptions( {
		queryKey: [ 'titan-dkim-status' ],
		queryFn: () => fetchTitanDkimStatus(),
		refetchOnWindowFocus: false,
		retry: false,
	} );

/**
 * Queues a new check for every domain whose DKIM record is missing. The response is the
 * cached list, so the new results only show up in a later `titanDkimStatusQuery` fetch. It
 * isn't written to that query's cache: it could arrive after a newer poll and overwrite it.
 */
export const titanDkimStatusRecheckMutation = () =>
	mutationOptions( {
		meta: { statId: 'titan-dkim-status-recheck' },
		mutationFn: () => fetchTitanDkimStatus( { force: true } ),
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
