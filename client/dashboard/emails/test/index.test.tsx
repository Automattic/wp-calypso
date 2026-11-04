/**
 * @jest-environment jsdom
 */

import { EmailProvider } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../test-utils';
import Emails from '../index';
import type { DomainSummary, EmailAccount } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const isEnabled = ( flag: string ) => flag === 'emails/titan-tiers' || actual.isEnabled( flag );
	const config = Object.assign( ( key: string ) => actual( key ), actual, { isEnabled } );
	return Object.assign( config, { __esModule: true, default: config } );
} );

jest.mock( '../../app/router/emails', () => {
	const actual = jest.requireActual( '../../app/router/emails' );
	return {
		...actual,
		emailsRoute: {
			...actual.emailsRoute,
			useSearch: () => ( {} ),
		},
	};
} );

const DOMAIN = 'cool.webrw.blog';

// A domain the current user administers but does not own, as returned by /all-domains.
const nonOwnedDomain = {
	domain: DOMAIN,
	blog_id: 1,
	blog_name: 'webrw',
	site_slug: 'webrw.blog',
	subtype: { id: 'domain_registration', label: 'Domain Registration' },
	current_user_is_owner: false,
} as DomainSummary;

const forwardingAccount = {
	account_type: EmailProvider.Forwarding,
	// The domain owner holds the subscription, so this user cannot buy paid email.
	can_user_add_email: false,
	status: 'active',
	warnings: [],
	domains: [ { domain: DOMAIN, is_primary: true } ],
	emails: [
		{
			mailbox: 'yea',
			domain: DOMAIN,
			target: 'someone@example.com',
			email_type: 'email_forward',
			role: 'standard',
			warnings: [],
		},
	],
} as unknown as EmailAccount;

function mockApi( { domains, accounts }: { domains: DomainSummary[]; accounts: EmailAccount[] } ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );

	// The flag is what makes the endpoint report domains the user manages but doesn't own,
	// so match on it rather than accepting any query.
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1/me/mailboxes' )
		.query( ( q ) => q.include_all_managed_domains === 'true' )
		.reply( 200, accounts );
}

describe( '<Emails>', () => {
	// DOTMSD-1477
	test( 'lists forwards on a domain the user administers but does not own', async () => {
		mockApi( { domains: [ nonOwnedDomain ], accounts: [ forwardingAccount ] } );
		render( <Emails /> );

		expect( await screen.findByText( `yea@${ DOMAIN }` ) ).toBeVisible();
		expect( screen.queryByText( 'You need a domain to set up email' ) ).not.toBeInTheDocument();
	} );

	// DOTMSD-1477
	test( 'does not claim the user has no domain when they only administer one', async () => {
		mockApi( { domains: [ nonOwnedDomain ], accounts: [] } );
		render( <Emails /> );

		expect( await screen.findByText( 'Set up email for your domain' ) ).toBeVisible();
		expect( screen.queryByText( 'You need a domain to set up email' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the no-domain empty state when the user has only a default address', async () => {
		mockApi( {
			domains: [
				{
					...nonOwnedDomain,
					domain: 'webrw.wordpress.com',
					subtype: { id: 'default_address', label: 'Default Address' },
				} as DomainSummary,
			],
			accounts: [],
		} );
		render( <Emails /> );

		expect( await screen.findByText( 'You need a domain to set up email' ) ).toBeVisible();
	} );

	test( 'counts free mailboxes, not domains, in the unused mailbox notice', async () => {
		const titanAccount = {
			account_type: EmailProvider.Titan,
			can_user_add_email: true,
			status: 'active',
			maximum_mailboxes: 3,
			warnings: [ { warning_slug: 'unused_mailboxes', message: '' } ],
			domains: [ { domain: DOMAIN, is_primary: true } ],
			emails: [
				{
					mailbox: 'hello',
					domain: DOMAIN,
					email_type: 'email',
					role: 'standard',
					warnings: [],
				},
			],
		} as unknown as EmailAccount;
		mockApi( { domains: [ nonOwnedDomain ], accounts: [ titanAccount ] } );
		render( <Emails /> );

		expect(
			await screen.findByText( 'You have 2 free mailboxes waiting to be set up.' )
		).toBeVisible();
	} );

	test( 'opens the DNS records from a Titan mailbox row action', async () => {
		const titanAccount = {
			account_type: EmailProvider.Titan,
			can_user_add_email: true,
			status: 'active',
			maximum_mailboxes: 1,
			warnings: [],
			domains: [ { domain: DOMAIN, is_primary: true } ],
			emails: [
				{ mailbox: 'hello', domain: DOMAIN, email_type: 'email', role: 'standard', warnings: [] },
			],
		} as unknown as EmailAccount;
		mockApi( { domains: [ nonOwnedDomain ], accounts: [ titanAccount ] } );
		render( <Emails /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Actions' } ) );
		await userEvent.click( await screen.findByRole( 'menuitem', { name: 'View DNS records' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: `DNS records for ${ DOMAIN }` } )
		).toBeVisible();
	} );

	describe( 'with Titan tiers', () => {
		const titanAccountWithSlug = ( productSlug: string ) =>
			( {
				account_type: EmailProvider.Titan,
				product_slug: productSlug,
				can_user_add_email: true,
				status: 'active',
				maximum_mailboxes: 1,
				warnings: [],
				domains: [ { domain: DOMAIN, is_primary: true } ],
				emails: [
					{ mailbox: 'hello', domain: DOMAIN, email_type: 'email', role: 'standard', warnings: [] },
				],
			} ) as unknown as EmailAccount;

		test( 'shows the mailbox plan and offers an upgrade', async () => {
			mockApi( {
				domains: [ nonOwnedDomain ],
				accounts: [ titanAccountWithSlug( 'wp_titan_mail_premium_yearly' ) ],
			} );
			render( <Emails /> );

			expect( await screen.findByRole( 'columnheader', { name: /Plan/ } ) ).toBeVisible();
			expect( screen.getByText( 'Plus' ) ).toBeVisible();

			await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );
			expect( await screen.findByRole( 'menuitem', { name: 'Upgrade mailbox' } ) ).toBeVisible();
		} );

		test( 'shows Business Starter for Google Workspace mailboxes', async () => {
			mockApi( {
				domains: [ nonOwnedDomain ],
				accounts: [
					{
						...titanAccountWithSlug( 'wp_google_workspace_business_starter_yearly' ),
						account_type: EmailProvider.Google,
					} as EmailAccount,
				],
			} );
			render( <Emails /> );

			expect( await screen.findByText( 'Business Starter' ) ).toBeVisible();
		} );

		test( 'does not offer an upgrade on the highest plan', async () => {
			mockApi( {
				domains: [ nonOwnedDomain ],
				accounts: [ titanAccountWithSlug( 'wp_titan_mail_ultra_yearly' ) ],
			} );
			render( <Emails /> );

			await userEvent.click( await screen.findByRole( 'button', { name: 'Actions' } ) );
			expect( await screen.findByRole( 'menuitem', { name: 'View DNS records' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'menuitem', { name: 'Upgrade mailbox' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
