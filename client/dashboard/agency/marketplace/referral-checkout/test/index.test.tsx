/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import ReferralCheckout from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const products = [
	{
		name: 'Jetpack VaultPress Backup (10GB)',
		slug: 'jetpack-backup-t1',
		products: [
			{
				name: 'Jetpack VaultPress Backup (10GB)',
				slug: 'jetpack-backup-t1',
				product_id: 2112,
				yearly_product_id: 2113,
				currency: 'USD',
				monthly_price: 4.95,
				yearly_price: 47.4,
			},
		],
	},
];

function mockApi() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{ id: AGENCY_ID, profile: { company_details: { logo_url: 'https://a/logo.png' } } },
		] )
		.persist();
	nock( API ).get( '/wpcom/v2/agency/products' ).query( true ).reply( 200, products ).persist();
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: [], total_items: 0, total_pages: 1 } )
		.persist();
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
}

describe( '<ReferralCheckout>', () => {
	beforeEach( () => {
		sessionStorage.setItem( 'referrals-shopping-card-selected-items', 'jetpack-backup-t1:1' );
	} );

	afterEach( () => {
		nock.cleanAll();
		sessionStorage.clear();
	} );

	test( 'lists the cart with what the client pays and the commission', async () => {
		mockApi();
		render( <ReferralCheckout /> );

		expect( await screen.findByText( 'VaultPress Backup 10GB' ) ).toBeVisible();
		expect( screen.getByText( 'Total your client will pay' ) ).toBeVisible();
		expect( screen.getByText( 'Your estimated commission' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Send to client' } ) ).toBeDisabled();
	} );

	test( 'rejects an invalid email without sending', async () => {
		mockApi();
		const user = userEvent.setup();
		render( <ReferralCheckout /> );
		await screen.findByText( 'VaultPress Backup 10GB' );

		await user.type( screen.getByLabelText( 'Client’s email address' ), 'not-an-email' );
		await user.click( screen.getByRole( 'button', { name: 'Send to client' } ) );

		expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
			'Please provide correct email address'
		);
	} );

	test( 'sends the payment request with the term product and the profile logo', async () => {
		mockApi();
		let body: Record< string, unknown > | undefined;
		nock( API )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/referrals`, ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, {
				id: 9,
				client: { id: 1, email: 'client@example.com' },
				products: [],
				status: 'pending',
				checkout_url: 'https://wordpress.com/checkout/agency/referral?x=1',
			} );
		const user = userEvent.setup();
		render( <ReferralCheckout /> );
		await screen.findByText( 'VaultPress Backup 10GB' );

		await user.type( screen.getByLabelText( 'Client’s email address' ), 'client@example.com' );
		await user.click( screen.getByRole( 'button', { name: 'Send to client' } ) );

		await waitFor( () => expect( body ).toBeDefined() );
		expect( body ).toMatchObject( {
			client_email: 'client@example.com',
			product_ids: '2113',
			flow_type: 'send',
			logo: { type: 'profile' },
		} );
		await waitFor( () =>
			expect( sessionStorage.getItem( 'referrals-shopping-card-selected-items' ) ).toBeNull()
		);
	} );

	test( 'shows the empty state with a way back when the cart is empty', async () => {
		sessionStorage.clear();
		mockApi();
		render( <ReferralCheckout /> );

		expect( await screen.findByText( 'Your cart is empty.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Back to the marketplace' } ) ).toBeVisible();
	} );
} );
