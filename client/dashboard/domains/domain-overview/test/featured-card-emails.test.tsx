/**
 * @jest-environment jsdom
 */
import { DomainSubtype, EmailProvider, type Domain, type EmailAccount } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import FeaturedCardEmails from '../featured-card-emails';

const blogId = 123;

const mockDomain = ( domainName: string ): Domain =>
	( {
		domain: domainName,
		blog_id: blogId,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
	} ) as Domain;

const mockAccount = ( domainName: string, mailboxes: string[] ): EmailAccount =>
	( {
		account_type: EmailProvider.Titan,
		domains: [ { domain: domainName, is_primary: true } ],
		warnings: [],
		emails: mailboxes.map( ( mailbox ) => ( {
			mailbox,
			domain: domainName,
			email_type: 'email',
			role: 'standard',
			warnings: [],
		} ) ),
		status: 'active',
	} ) as unknown as EmailAccount;

function renderCard( domainName: string, accounts: EmailAccount[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ blogId }/emails/accounts/${ domainName }/mailboxes` )
		.query( true )
		.reply( 200, { accounts } );

	return render( <FeaturedCardEmails domain={ mockDomain( domainName ) } /> );
}

describe( 'FeaturedCardEmails', () => {
	test( 'shows the first mailbox belonging to the domain', async () => {
		renderCard( 'example.com', [ mockAccount( 'example.com', [ 'me' ] ) ] );

		expect( await screen.findByText( 'me@example.com' ) ).toBeVisible();
		expect( screen.getByText( 'Professional Email' ) ).toBeVisible();
	} );

	test( 'does not display mailbox just because a sibling domain has one', async () => {
		renderCard( 'b.com', [ mockAccount( 'a.com', [ 'me' ] ) ] );

		expect( await screen.findByText( 'No email address' ) ).toBeVisible();
		expect( screen.queryByText( 'me@b.com' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Stand out with professional email.' ) ).toBeVisible();
	} );

	test( 'counts the additional mailboxes on the domain', async () => {
		renderCard( 'example.com', [ mockAccount( 'example.com', [ 'me', 'info', 'sales' ] ) ] );

		expect( await screen.findByText( 'me@example.com' ) ).toBeVisible();
		expect( screen.getByText( '+ 2 more mailboxes' ) ).toBeVisible();
	} );
} );
