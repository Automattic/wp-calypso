/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import MarketplacePurchases from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;
const LICENSE_KEY = 'wpcom-hosting-business_abc';

const unassignedWpcomLicense = {
	license_id: 1,
	license_key: LICENSE_KEY,
	product_id: 1,
	product: 'WordPress.com Business',
	user_id: null,
	username: null,
	blog_id: null,
	siteurl: null,
	has_downloads: false,
	issued_at: '2026-01-01 00:00:00',
	attached_at: null,
	revoked_at: null,
	owner_type: 'jetpack_partner_key',
	quantity: null,
	parent_license_id: null,
	meta: null,
	referral: null,
};

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
}

// The view is persisted to user preferences, which the page reads on mount.
function mockPreferences() {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
}

function mockLicenses() {
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: [ unassignedWpcomLicense ], total_items: 1, total_pages: 1 } )
		.persist();
}

function mockPendingSites( state: string ) {
	nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` )
		.reply( 200, [ { id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state } } } ] )
		.persist();
}

async function openRowActions() {
	const user = userEvent.setup();
	await user.click( await screen.findByRole( 'button', { name: 'Actions' } ) );
	return user;
}

describe( '<MarketplacePurchases>', () => {
	afterEach( () => {
		nock.cleanAll();
		sessionStorage.clear();
		window.history.replaceState( {}, '', '/marketplace/purchases' );
	} );

	test( 'empties the cart and drops the receipt when a checkout returns here', async () => {
		mockAgency();
		mockPreferences();
		mockLicenses();
		mockPendingSites( 'pending' );
		sessionStorage.setItem( 'shopping-card-selected-items', 'jetpack-backup-t1:1' );
		window.history.replaceState(
			{},
			'',
			'/marketplace/purchases?status=unassigned&receipt_id=123&flash=checkout-success'
		);

		render( <MarketplacePurchases /> );

		await waitFor( () => expect( window.location.search ).toBe( '?status=unassigned' ) );
		expect( sessionStorage.getItem( 'shopping-card-selected-items' ) ).toBeNull();
	} );

	test( 'leaves the cart alone without a receipt', async () => {
		mockAgency();
		mockPreferences();
		mockLicenses();
		mockPendingSites( 'pending' );
		sessionStorage.setItem( 'shopping-card-selected-items', 'jetpack-backup-t1:1' );

		render( <MarketplacePurchases /> );
		await screen.findByText( 'Not assigned' );

		expect( sessionStorage.getItem( 'shopping-card-selected-items' ) ).toBe(
			'jetpack-backup-t1:1'
		);
	} );

	test( 'reports a license whose site is being created', async () => {
		mockAgency();
		mockPreferences();
		mockLicenses();
		mockPendingSites( 'provisioning' );

		render( <MarketplacePurchases /> );

		expect( await screen.findByText( 'Being created…' ) ).toBeVisible();
	} );

	test( 'keeps site creation out of reach while a site is being created', async () => {
		mockAgency();
		mockPreferences();
		mockLicenses();
		mockPendingSites( 'provisioning' );

		render( <MarketplacePurchases /> );
		await screen.findByText( 'Being created…' );
		await openRowActions();

		// The action stays in the menu so the agency can see it exists; the Site
		// column is what says why it is out of reach.
		expect( await screen.findByRole( 'menuitem', { name: 'Create site' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'offers site creation when nothing is being created', async () => {
		mockAgency();
		mockPreferences();
		mockLicenses();
		mockPendingSites( 'pending' );

		render( <MarketplacePurchases /> );
		await screen.findByText( 'Not assigned' );
		await openRowActions();

		expect( await screen.findByRole( 'menuitem', { name: 'Create site' } ) ).not.toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );
} );
