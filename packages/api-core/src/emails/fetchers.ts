import { wpcom } from '../wpcom-fetcher';
import type { EmailAccount, Mailbox } from './types';

export function fetchMailboxes( siteId: number ): Promise< Mailbox[] > {
	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/emails/mailboxes`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( ( data: { mailboxes: Mailbox[] } ) => data.mailboxes );
}

export function fetchDomainMailboxAccounts(
	siteId: number,
	domain: string
): Promise< EmailAccount[] > {
	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/emails/accounts/${ domain }/mailboxes`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( ( data: { accounts: EmailAccount[] } ) => data.accounts );
}
