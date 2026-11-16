/**
 * @vitest-environment jsdom
 */
import { type Domain, type EmailAccount } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainEmailsSettingsSummary from '../emails-summary';

const blogId = 123;

const mockAccount = ( domainName: string, mailboxes: string[] ) =>
	( {
		emails: mailboxes.map( ( mailbox ) => ( { mailbox, domain: domainName } ) ),
	} ) as unknown as EmailAccount;

function renderSummary( domainName: string, status: number, accounts: EmailAccount[] = [] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ blogId }/emails/accounts/${ domainName }/mailboxes` )
		.query( true )
		.reply( status, { accounts } );

	return render(
		<DomainEmailsSettingsSummary domain={ { domain: domainName, blog_id: blogId } as Domain } />
	);
}

const getRow = () => screen.getByRole( 'link', { name: /Professional email/ } );

describe( 'DomainEmailsSettingsSummary', () => {
	test( 'counts the mailboxes on the domain and links to the list', async () => {
		renderSummary( 'example.com', 200, [
			mockAccount( 'example.com', [ 'me', 'info', 'sales' ] ),
		] );

		expect( await screen.findByText( '3 mailboxes' ) ).toBeVisible();
		expect( getRow() ).toHaveAttribute( 'href', '/emails?domainName=example.com' );
	} );

	test( 'offers the add flow when the domain has no mailboxes, ignoring sibling domains', async () => {
		renderSummary( 'b.com', 200, [ mockAccount( 'a.com', [ 'me' ] ) ] );

		await waitFor( () =>
			expect( getRow() ).toHaveAttribute( 'href', '/emails/choose-email-solution/b.com' )
		);
		expect( screen.queryByText( /mailbox/ ) ).not.toBeInTheDocument();
	} );

	test( 'links to the list while the mailboxes load and after they fail', async () => {
		const { queryClient } = renderSummary( 'example.com', 500 );
		const { queryKey } = mailboxAccountsQuery( blogId, 'example.com' );

		expect( getRow() ).toHaveAttribute( 'href', '/emails?domainName=example.com' );

		await waitFor( () => expect( queryClient.getQueryState( queryKey )?.status ).toBe( 'error' ) );
		expect( getRow() ).toHaveAttribute( 'href', '/emails?domainName=example.com' );
	} );
} );
