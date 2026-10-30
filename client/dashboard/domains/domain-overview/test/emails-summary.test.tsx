/**
 * @jest-environment jsdom
 */
import { DomainSubtype, EmailProvider, type Domain, type EmailAccount } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainEmailsSettingsSummary from '../emails-summary';

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

function renderSummary( domainName: string, accounts: EmailAccount[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ blogId }/emails/accounts/${ domainName }/mailboxes` )
		.query( true )
		.reply( 200, { accounts } );

	return render( <DomainEmailsSettingsSummary domain={ mockDomain( domainName ) } /> );
}

describe( 'DomainEmailsSettingsSummary', () => {
	test( 'counts the mailboxes on the domain', async () => {
		renderSummary( 'example.com', [ mockAccount( 'example.com', [ 'me', 'info', 'sales' ] ) ] );

		expect( await screen.findByText( '3 mailboxes' ) ).toBeVisible();
	} );

	test( 'does not count mailboxes of a sibling domain', async () => {
		renderSummary( 'b.com', [ mockAccount( 'a.com', [ 'me' ] ) ] );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( screen.getByRole( 'link', { name: /Professional email/ } ) ).toBeVisible();
		expect( screen.queryByText( /mailbox/ ) ).not.toBeInTheDocument();
	} );
} );
