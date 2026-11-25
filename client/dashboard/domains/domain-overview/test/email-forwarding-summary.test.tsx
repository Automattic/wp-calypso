/**
 * @vitest-environment jsdom
 */
import { EmailProvider, type Domain, type EmailAccount } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainEmailForwardingSettingsSummary from '../email-forwarding-summary';

const blogId = 123;

const mockAccount = (
	accountType: EmailProvider,
	domainName: string,
	boxes: { mailbox: string; target?: string }[]
) =>
	( {
		account_type: accountType,
		domains: [ { domain: domainName, is_primary: true } ],
		emails: boxes.map( ( box ) => ( { ...box, domain: domainName } ) ),
	} ) as unknown as EmailAccount;

function renderSummary(
	domainName: string,
	status: number,
	accounts: EmailAccount[] = [],
	domainProps: Partial< Domain > = {}
) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ blogId }/emails/accounts/${ domainName }/mailboxes` )
		.query( true )
		.reply( status, { accounts } );

	return render(
		<DomainEmailForwardingSettingsSummary
			domain={
				{
					domain: domainName,
					blog_id: blogId,
					current_user_can_add_email: true,
					...domainProps,
				} as Domain
			}
		/>
	);
}

const getRow = () => screen.getByRole( 'link', { name: /Email forwarding/ } );
const LIST = '/emails?domainName=example.com';

describe( '<DomainEmailForwardingSettingsSummary>', () => {
	test( 'counts each forwarding address once and links to the list', async () => {
		renderSummary( 'example.com', 200, [
			mockAccount( EmailProvider.Forwarding, 'example.com', [
				{ mailbox: 'me', target: 'a@other.com' },
				{ mailbox: 'me', target: 'b@other.com' },
				{ mailbox: 'info', target: 'a@other.com' },
			] ),
			mockAccount( EmailProvider.Titan, 'example.com', [ { mailbox: 'sales' } ] ),
		] );

		expect( await screen.findByText( '2 forwarders' ) ).toBeVisible();
		expect( getRow() ).toHaveAttribute( 'href', LIST );
	} );

	test( 'offers the add flow for this domain when it has no forwarders, ignoring sibling domains', async () => {
		renderSummary( 'b.com', 200, [
			mockAccount( EmailProvider.Forwarding, 'a.com', [ { mailbox: 'me' } ] ),
			mockAccount( EmailProvider.Forwarding, 'b.com', [] ),
		] );

		await waitFor( () =>
			expect( getRow() ).toHaveAttribute( 'href', '/emails/add-forwarder?domainName=b.com' )
		);
		expect( screen.queryByText( /forwarder/ ) ).not.toBeInTheDocument();
	} );

	test( 'offers the add flow when the response has no forwarding account', async () => {
		renderSummary( 'example.com', 200, [] );

		await waitFor( () =>
			expect( getRow() ).toHaveAttribute( 'href', '/emails/add-forwarder?domainName=example.com' )
		);
	} );

	test( 'links to the list when the user cannot add email', async () => {
		const { queryClient } = renderSummary(
			'example.com',
			200,
			[ mockAccount( EmailProvider.Forwarding, 'example.com', [] ) ],
			{ current_user_can_add_email: false }
		);
		const { queryKey } = mailboxAccountsQuery( blogId, 'example.com' );

		await waitFor( () =>
			expect( queryClient.getQueryState( queryKey )?.status ).toBe( 'success' )
		);
		expect( getRow() ).toHaveAttribute( 'href', LIST );
	} );

	test( 'links to the list while the forwarders load and after they fail', async () => {
		const { queryClient } = renderSummary( 'example.com', 500 );
		const { queryKey } = mailboxAccountsQuery( blogId, 'example.com' );

		expect( getRow() ).toHaveAttribute( 'href', LIST );

		await waitFor( () => expect( queryClient.getQueryState( queryKey )?.status ).toBe( 'error' ) );
		expect( getRow() ).toHaveAttribute( 'href', LIST );
	} );
} );
