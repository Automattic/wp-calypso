import { wpcom } from '../wpcom-fetcher';
import type { EmailAccount, Mailbox, TitanControlPanelContext } from './types';

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

/**
 * Returns a single-use URL that logs the current user into Titan's control panel.
 * `orderId` is the Titan subscription's order id (`domain.titan_mail_subscription.order_id`),
 * and `context` deep-links to a specific section of the control panel.
 */
export function fetchTitanControlPanelAutoLoginUrl(
	orderId: number,
	context?: TitanControlPanelContext
): Promise< string > {
	return wpcom.req
		.get(
			{
				path: `/emails/titan/${ encodeURIComponent( orderId ) }/control-panel-auto-login-url`,
				apiNamespace: 'wpcom/v2',
			},
			context ? { context } : {}
		)
		.then( ( data: { auto_login_url: string } ) => data.auto_login_url );
}
