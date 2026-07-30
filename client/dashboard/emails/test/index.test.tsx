/**
 * @jest-environment jsdom
 */

import { EmailProvider } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../test-utils';
import Emails from '../index';
import type { DomainSummary, EmailAccount } from '@automattic/api-core';

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

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1/me/mailboxes' )
		.query( true )
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
} );
