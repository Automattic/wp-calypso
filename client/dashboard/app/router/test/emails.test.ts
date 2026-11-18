/**
 * @vitest-environment jsdom
 */
import { domainQuery, mailboxAccountsQuery, queryClient } from '@automattic/api-queries';
import nock from 'nock';
import { setUpMailboxRoute } from '../emails';
import type { EmailAccount } from '@automattic/api-core';

const DOMAIN = 'example.com';
const SITE_ID = 123;

const fullAccount = {
	maximum_mailboxes: 1,
	emails: [ { mailbox: 'hello' } ],
	warnings: [],
} as unknown as EmailAccount;

const accountWithFreeMailbox = {
	maximum_mailboxes: 2,
	emails: [ { mailbox: 'hello' } ],
	warnings: [ { warning_slug: 'unused_mailboxes', message: '' } ],
} as unknown as EmailAccount;

function mockAccounts( accounts: EmailAccount[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ SITE_ID }/emails/accounts/${ DOMAIN }/mailboxes` )
		.reply( 200, { accounts } );
}

function enterSetUpMailbox() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const beforeLoad = setUpMailboxRoute.options.beforeLoad as any;
	return beforeLoad( { params: { domain: DOMAIN } } ).catch( ( error: unknown ) => error );
}

describe( 'setUpMailboxRoute', () => {
	beforeEach( () => {
		queryClient.clear();
		queryClient.setQueryData( domainQuery( DOMAIN ).queryKey, {
			domain: DOMAIN,
			blog_id: SITE_ID,
		} as never );
	} );

	test( 'opens when a free mailbox is missing from the cached accounts', async () => {
		queryClient.setQueryData( mailboxAccountsQuery( SITE_ID, DOMAIN ).queryKey, [ fullAccount ] );
		mockAccounts( [ accountWithFreeMailbox ] );

		expect( await enterSetUpMailbox() ).toBeUndefined();
	} );

	test( 'redirects to the emails list when no mailbox is free', async () => {
		mockAccounts( [ fullAccount ] );

		expect( await enterSetUpMailbox() ).toMatchObject( {
			options: { search: { domainName: DOMAIN } },
		} );
	} );
} );
