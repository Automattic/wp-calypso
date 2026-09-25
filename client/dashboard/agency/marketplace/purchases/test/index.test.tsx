/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../../app/snackbars';
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
function mockPreferences( feedback?: Record< string, unknown > ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: feedback ? { 'a4a-feedback': feedback } : {},
		} )
		.persist();
}

function mockLicenses() {
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: [ unassignedWpcomLicense ], total_items: 1, total_pages: 1 } )
		.persist();
}

// A WordPress.com hosting license (like unassignedWpcomLicense) is only ever
// offered "Create site", never "Assign to site", so the assign flow needs its
// own, otherwise-assignable license.
const ASSIGNABLE_LICENSE_KEY = 'jetpack-backup-t1_xyz';

const unassignedJetpackLicense = {
	license_id: 2,
	license_key: ASSIGNABLE_LICENSE_KEY,
	product_id: 2,
	product: 'Jetpack VaultPress Backup',
	user_id: null,
	username: null,
	blog_id: null,
	siteurl: null,
	has_downloads: true,
	issued_at: '2026-01-01 00:00:00',
	attached_at: null,
	revoked_at: null,
	owner_type: 'jetpack_partner_key',
	quantity: null,
	parent_license_id: null,
	meta: null,
	referral: null,
};

function mockAssignableLicense() {
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: [ unassignedJetpackLicense ], total_items: 1, total_pages: 1 } )
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

function mockAssignableSites() {
	nock( API )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: [ { blog_id: 55, url: 'https://client.example.com' } ], total: 1 } )
		.persist();
}

function mockAssign() {
	nock( API )
		.post( `/wpcom/v2/jetpack-licensing/license/${ ASSIGNABLE_LICENSE_KEY }/site` )
		.reply( 200, {} );
}

async function assignLicense() {
	const user = await openRowActions();
	await user.click( await screen.findByRole( 'menuitem', { name: 'Assign to site' } ) );
	await user.click( await screen.findByRole( 'radio', { name: 'https://client.example.com' } ) );
	await user.click( screen.getByRole( 'button', { name: 'Assign to selected site' } ) );
	return user;
}

describe( '<MarketplacePurchases>', () => {
	afterEach( () => nock.cleanAll() );

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

	test( 'does not ask a partner who already answered', async () => {
		// SnackbarList reaches for window.scrollTo, which jsdom does not implement.
		window.scrollTo = jest.fn();
		mockAgency();
		mockPreferences( { 'purchase-completed': { lastSubmittedAt: 1757000000000 } } );
		mockAssignableLicense();
		mockPendingSites( 'pending' );
		mockAssignableSites();
		mockAssign();

		render(
			<>
				<MarketplacePurchases />
				<Snackbars />
			</>
		);
		await screen.findByText( 'Not assigned' );
		await assignLicense();

		await waitFor( () =>
			expect(
				screen.queryByRole( 'button', { name: 'Assign to selected site' } )
			).not.toBeInTheDocument()
		);
		expect( screen.queryByText( 'Purchase complete!' ) ).not.toBeInTheDocument();
		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText(
			'Jetpack VaultPress Backup has been assigned to https://client.example.com.'
		);
		expect( notice ).toBeVisible();
	} );
} );
