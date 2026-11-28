/**
 * @jest-environment jsdom
 */
import { DomainStatus } from '@automattic/api-core';
import { within } from '@testing-library/react';
import { render } from '../../../test-utils';
import { EmailNonDomainOwnerNotice } from '../email-non-domain-owner-notice';
import type { Domain } from '@automattic/api-core';

const DOMAIN_NAME = 'example.com';
const OWNER = 'domainowner';

const expiredDomain: Partial< Domain > = {
	domain: DOMAIN_NAME,
	owner: OWNER,
	privacy_available: true,
	current_user_is_owner: true,
	expired: true,
	current_user_cannot_add_email_reason: {
		errors: { 'domain-expired': [ 'Email cannot be purchased for an expired domain.' ] },
	},
};

function renderNotice( overrides: Partial< Domain > = {} ) {
	const { container } = render(
		<EmailNonDomainOwnerNotice domain={ { ...expiredDomain, ...overrides } as Domain } />
	);
	return within( container );
}

const recoveryStates: { name: string; overrides: Partial< Domain > }[] = [
	{ name: 'grace period', overrides: { is_redeemable: false } },
	{ name: 'redemption', overrides: { is_redeemable: true } },
	{
		name: 'pending renewal',
		overrides: {
			domain_status: {
				id: DomainStatus.PENDING_RENEWAL,
				label: 'Pending renewal',
				type: 'warning',
			},
		},
	},
	{ name: 'auction', overrides: { aftermarket_auction: true } },
];

describe( '<EmailNonDomainOwnerNotice>', () => {
	test.each( recoveryStates )(
		'explains expiration to the owner during $name without offering an unusable renewal link',
		async ( { overrides } ) => {
			const view = renderNotice( overrides );

			const notice = await view.findByText( /Email services cannot be purchased for/ );
			expect( notice ).toHaveTextContent(
				`Email services cannot be purchased for ${ DOMAIN_NAME } because the domain has expired.`
			);
			expect( notice ).toHaveTextContent( 'for help renewing it.' );
			expect( view.getAllByRole( 'link' ) ).toHaveLength( 1 );
			expect( view.getByRole( 'link', { name: /contact support/ } ) ).toHaveAttribute(
				'href',
				expect.stringContaining( '/support/contact' )
			);
			expect(
				view.queryByRole( 'link', { name: /log in|reach out|renew now/i } )
			).not.toBeInTheDocument();
			expect( view.queryByRole( 'button', { name: /dismiss/i } ) ).not.toBeInTheDocument();
		}
	);

	test( 'uses the ownership flag when the expired domain owner has no username', async () => {
		const view = renderNotice( { owner: '' } );

		expect( await view.findByText( /because the domain has expired/ ) ).toBeVisible();
		expect( view.queryByText( /can only be purchased by the owner/ ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the existing message for an active domain owner', async () => {
		const view = renderNotice( { expired: false, current_user_cannot_add_email_reason: null } );

		expect( await view.findByRole( 'link', { name: /log in with the account/ } ) ).toBeVisible();
		expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
	} );

	test( 'uses the expiration blocker when the expired flag has not been set', async () => {
		const view = renderNotice( { expired: false } );

		expect( await view.findByText( /because the domain has expired/ ) ).toBeVisible();
		expect(
			view.queryByRole( 'link', { name: /log in with the account/ } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the existing guidance when expiration is not the purchase blocker', async () => {
		const view = renderNotice( {
			current_user_cannot_add_email_reason: {
				errors: { 'other-user-owns-email': [ 'Another user owns the email subscription.' ] },
			},
		} );

		expect( await view.findByRole( 'link', { name: /log in with the account/ } ) ).toBeVisible();
		expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
	} );

	test.each( [ false, true ] )(
		'keeps the account and owner contact links for a non-owner when expired is %s',
		async ( expired ) => {
			const view = renderNotice( { current_user_is_owner: false, expired } );

			const notice = await view.findByText( /Email service can only be purchased by/ );
			expect( notice ).toHaveTextContent(
				`Email service can only be purchased by ${ OWNER }, who is the owner of ${ DOMAIN_NAME }.`
			);
			expect( view.getByRole( 'link', { name: /log in with the account/ } ) ).toHaveAttribute(
				'href',
				expect.stringContaining( 'redirect_to=' )
			);
			expect( view.getByRole( 'link', { name: `reach out to ${ OWNER }` } ) ).toHaveAttribute(
				'href',
				`https://privatewho.is/?s=${ DOMAIN_NAME }`
			);
			expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
		}
	);

	test( 'keeps ownership guidance when the ownership flag is unknown', async () => {
		const view = renderNotice( { current_user_is_owner: null } );

		expect( await view.findByRole( 'link', { name: /log in with the account/ } ) ).toBeVisible();
		expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the generic owner guidance when the owner username is unavailable', async () => {
		const view = renderNotice( { current_user_is_owner: false, owner: '' } );

		expect(
			await view.findByText( /Email service can only be purchased by the owner of/ )
		).toHaveTextContent( DOMAIN_NAME );
		expect( view.getAllByRole( 'link' ) ).toHaveLength( 1 );
		expect( view.getByRole( 'link', { name: /contact support/ } ) ).toBeVisible();
	} );

	test( 'keeps the existing fallback when no domain is supplied', async () => {
		const { container } = render( <EmailNonDomainOwnerNotice /> );
		const view = within( container );

		expect(
			await view.findByText( /Email service can only be purchased by the owner of/ )
		).toBeVisible();
		expect( view.getByRole( 'link', { name: /contact support/ } ) ).toBeVisible();
		expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
	} );
} );
