/**
 * @jest-environment jsdom
 */
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { useShoppingCart } from '../../products/use-shopping-cart';
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

const freeProducts = [
	{
		name: 'Jetpack Stats (Free)',
		slug: 'jetpack-stats-free',
		products: [
			{
				name: 'Jetpack Stats (Free)',
				slug: 'jetpack-stats-free',
				product_id: 2220,
				currency: 'USD',
				amount: '0',
				monthly_price: 0,
				yearly_price: 0,
			},
		],
	},
	{
		name: 'Jetpack Boost (Free)',
		slug: 'jetpack-boost-free',
		products: [
			{
				name: 'Jetpack Boost (Free)',
				slug: 'jetpack-boost-free',
				product_id: 2221,
				currency: 'USD',
				amount: '0',
				monthly_price: 0,
				yearly_price: 0,
			},
		],
	},
];

function mockApi( {
	agency = {},
	catalog = products,
}: { agency?: Record< string, unknown >; catalog?: typeof products | typeof freeProducts } = {} ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{
				id: AGENCY_ID,
				approval_status: 'approved',
				profile: { company_details: { logo_url: 'https://a/logo.png' } },
				...agency,
			},
		] )
		.persist();
	nock( API ).get( '/wpcom/v2/agency/products' ).query( true ).reply( 200, catalog ).persist();
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

// The cart keeps its own copy of what is stored, so it is filled through the hook.
function fillCart( ...slugs: string[] ) {
	const { result } = renderHook( () => useShoppingCart( 'referral' ) );
	act( () => result.current.replaceItems( slugs.map( ( slug ) => ( { slug, quantity: 1 } ) ) ) );
}

describe( '<ReferralCheckout>', () => {
	beforeEach( () => {
		fillCart( 'jetpack-backup-t1' );
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

	test( 'sends one payment request when Send is clicked twice', async () => {
		mockApi();
		let requests = 0;
		nock( API )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/referrals`, () => {
				requests++;
				return true;
			} )
			.times( 2 )
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
		await user.dblClick( screen.getByRole( 'button', { name: 'Send to client' } ) );

		await waitFor( () =>
			expect( sessionStorage.getItem( 'referrals-shopping-card-selected-items' ) ).toBeNull()
		);
		expect( requests ).toBe( 1 );
	} );

	test( 'keeps a free cart from an agency that cannot issue licenses', async () => {
		fillCart( 'jetpack-stats-free' );
		mockApi( { agency: { can_issue_licenses: false }, catalog: freeProducts } );
		render( <ReferralCheckout /> );

		expect( await screen.findByRole( 'button', { name: 'Purchase' } ) ).toBeDisabled();
	} );

	test( 'lets an agency that can issue licenses purchase a free cart', async () => {
		fillCart( 'jetpack-stats-free' );
		mockApi( { catalog: freeProducts } );
		render( <ReferralCheckout /> );

		expect( await screen.findByRole( 'button', { name: 'Purchase' } ) ).toBeEnabled();
	} );

	test( 'keeps only the lines that failed after a partial free purchase', async () => {
		fillCart( 'jetpack-stats-free', 'jetpack-boost-free' );
		mockApi( { catalog: freeProducts } );
		const issued: string[] = [];
		nock( API )
			.post(
				'/wpcom/v2/jetpack-licensing/licenses',
				( body ) => body.product === 'jetpack-stats-free'
			)
			.reply( 200, () => {
				issued.push( 'jetpack-stats-free' );
				return [];
			} );
		nock( API )
			.post(
				'/wpcom/v2/jetpack-licensing/licenses',
				( body ) => body.product === 'jetpack-boost-free'
			)
			.reply( 500, { code: 'error', message: 'Nope' } );
		const user = userEvent.setup();
		render( <ReferralCheckout /> );

		await user.click( await screen.findByRole( 'button', { name: 'Purchase' } ) );

		await waitFor( () =>
			expect( sessionStorage.getItem( 'referrals-shopping-card-selected-items' ) ).toBe(
				'jetpack-boost-free:1'
			)
		);
		expect( issued ).toEqual( [ 'jetpack-stats-free' ] );
	} );
} );
