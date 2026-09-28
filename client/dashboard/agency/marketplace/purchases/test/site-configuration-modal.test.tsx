/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { getProvisioningSiteIds, untrackProvisioningSite } from '../../../sites/provisioning-sites';
import SiteConfigurationModal, { DevSiteConfigurationModal } from '../site-configuration-modal';
import type { JetpackLicense } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const LICENSE_KEY = 'wpcom-hosting-business_abc';

const license: JetpackLicense = {
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
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 1 } ] );
}

function mockPendingSites( sites: unknown[] ) {
	mockAgency();
	nock( API ).persist().get( '/wpcom/v2/agency/1/sites/pending' ).reply( 200, sites );
}

function mockAddressSuggestion( address: string ) {
	nock( API )
		.persist()
		.get( '/wpcom/v2/site-suggestions' )
		.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
	nock( API )
		.persist()
		.get( '/rest/v1.1/domains/suggestions' )
		.query( true )
		.reply( 200, [ { domain_name: `${ address }.wordpress.com` } ] );
}

function renderModal( closeModal = jest.fn() ) {
	render( <SiteConfigurationModal license={ license } closeModal={ closeModal } /> );
	return { closeModal, user: userEvent.setup() };
}

/**
 * The submit button stays disabled until the suggested address has settled
 * through the debounce, so clicking before that is a no-op.
 */
async function waitForSuggestedAddress() {
	await waitFor( () =>
		expect( screen.getByLabelText( 'Site address' ) ).toHaveValue( 'ramblingthoughts' )
	);
	await waitFor( () =>
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeEnabled()
	);
}

describe( '<SiteConfigurationModal>', () => {
	afterEach( () => {
		nock.cleanAll();
		getProvisioningSiteIds().forEach( untrackProvisioningSite );
	} );

	test( 'creates the site at the suggested address', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		const { closeModal, user } = renderModal();

		await waitForSuggestedAddress();

		const scope = nock( API )
			.post( '/wpcom/v2/agency/1/sites/7/provision', ( body ) => {
				expect( body ).toEqual(
					expect.objectContaining( {
						id: 7,
						site_name: 'ramblingthoughts',
						is_fully_managed_agency_site: false,
						php_version: expect.any( String ),
					} )
				);
				return true;
			} )
			.reply( 200, { success: true } );

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( closeModal ).toHaveBeenCalled();
		// The sites page reports on it from here.
		expect( getProvisioningSiteIds() ).toEqual( [ 7 ] );
	} );

	test( 'provisions the pending site belonging to this license', async () => {
		mockPendingSites( [
			{
				id: 3,
				features: { wpcom_atomic: { license_key: 'wpcom-hosting-other_xyz', state: 'pending' } },
			},
			{ id: 9, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		const { user } = renderModal();

		await waitForSuggestedAddress();

		const scope = nock( API )
			.post( '/wpcom/v2/agency/1/sites/9/provision' )
			.reply( 200, { success: true } );

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'offers nothing to configure once the license is already provisioning', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'provisioning' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		renderModal();

		expect(
			await screen.findByText(
				'This license has no site left to set up. If you just created one, it may still be provisioning.'
			)
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Create site' } ) ).not.toBeInTheDocument();
	} );

	// The modal opens from a row action, so a payload that is not the expected
	// list must leave it standing rather than throwing mid-render.
	test( 'survives a response that is not a list of pending sites', async () => {
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 1 } ] );
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency/1/sites/pending' )
			.reply( 200, { error: 'unauthorized' } );
		mockAddressSuggestion( 'ramblingthoughts' );
		renderModal();

		expect(
			await screen.findByText(
				'This license has no site left to set up. If you just created one, it may still be provisioning.'
			)
		).toBeVisible();
	} );

	test( 'keeps the agency fully managed when client access is turned off', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		const { user } = renderModal();

		await waitForSuggestedAddress();

		await user.click(
			screen.getByLabelText( 'Allow clients to use the Help Center and hosting features' )
		);

		const scope = nock( API )
			.post( '/wpcom/v2/agency/1/sites/7/provision', ( body ) => {
				expect( body.is_fully_managed_agency_site ).toBe( true );
				return true;
			} )
			.reply( 200, { success: true } );

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'offers a free address when the one typed is taken', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		nock( API )
			.persist()
			.post( '/wpcom/v2/agency/1/validate-site-address' )
			.reply( 200, { valid: false } );
		const { user } = renderModal();

		const input = await screen.findByLabelText( 'Site address' );
		await waitFor( () => expect( input ).toHaveValue( 'ramblingthoughts' ) );

		await user.clear( input );
		await user.type( input, 'takenname' );

		expect(
			await screen.findByRole( 'button', { name: 'ramblingthoughts' }, { timeout: 3000 } )
		).toBeVisible();
		await waitFor( () => expect( input ).toBeInvalid() );
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
	} );

	// An address is only verified by the check, so one that never came back must
	// not leave the button offering to create a site at it.
	test( 'keeps the button disabled when the address check fails', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		const scope = nock( API )
			.persist()
			.post( '/wpcom/v2/agency/1/validate-site-address' )
			.reply( 500, { message: 'Nope' } );
		const { user } = renderModal();

		await waitForSuggestedAddress();

		const input = screen.getByLabelText( 'Site address' );
		await user.clear( input );
		await user.type( input, 'uncheckedname' );

		expect( await screen.findByText( 'Checking availability…' ) ).toBeVisible();
		await waitFor(
			() =>
				expect(
					screen.getByText( 'You can connect a custom domain once the site is created.' )
				).toBeVisible(),
			{ timeout: 3000 }
		);

		expect( scope.isDone() ).toBe( true );
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
	} );

	// The suggested address is taken on trust until it isn't: it is only claimed
	// by the provision itself, so a failure there has to send it back for a check.
	test( 're-checks the suggested address when provisioning rejects it', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		nock( API )
			.persist()
			.get( '/wpcom/v2/site-suggestions' )
			.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
		// The title seeds the address; the address then seeds the alternative.
		nock( API )
			.persist()
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( { query } ) => query === 'rambling thoughts' )
			.reply( 200, [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );
		nock( API )
			.persist()
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( { query } ) => query === 'ramblingthoughts' )
			.reply( 200, [ { domain_name: 'ramblingthoughts2.wordpress.com' } ] );
		nock( API )
			.persist()
			.post( '/wpcom/v2/agency/1/validate-site-address' )
			.reply( 200, { valid: false } );
		nock( API )
			.post( '/wpcom/v2/agency/1/sites/7/provision' )
			.reply( 400, { message: 'Sorry, that site address is unavailable.' } );

		const { user } = renderModal();
		await waitForSuggestedAddress();

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		expect(
			await screen.findByRole( 'button', { name: 'ramblingthoughts2' }, { timeout: 3000 } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
	} );

	test( 'rejects an address with unsupported characters', async () => {
		mockPendingSites( [
			{ id: 7, features: { wpcom_atomic: { license_key: LICENSE_KEY, state: 'pending' } } },
		] );
		mockAddressSuggestion( 'ramblingthoughts' );
		const { user } = renderModal();

		const input = await screen.findByLabelText( 'Site address' );
		await waitFor( () => expect( input ).toHaveValue( 'ramblingthoughts' ) );

		await user.clear( input );
		await user.type( input, 'not valid' );
		// Validity messages show once the field has been left.
		await user.tab();

		expect(
			await screen.findByText( 'Your site address can only contain letters and numbers.' )
		).toBeVisible();
		await waitFor( () => expect( input ).toBeInvalid() );
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
	} );
} );

describe( '<DevSiteConfigurationModal>', () => {
	afterEach( () => {
		nock.cleanAll();
		getProvisioningSiteIds().forEach( untrackProvisioningSite );
	} );

	test( 'creates a development site at the suggested address', async () => {
		mockAgency();
		mockAddressSuggestion( 'ramblingthoughts' );
		const closeModal = jest.fn();
		render( <DevSiteConfigurationModal closeModal={ closeModal } /> );
		const user = userEvent.setup();

		await waitForSuggestedAddress();

		const scope = nock( API )
			.post( '/wpcom/v2/agency/1/sites/provision-dev-site', ( body ) => {
				expect( body ).toEqual(
					expect.objectContaining( {
						site_name: 'ramblingthoughts',
						php_version: expect.any( String ),
						// Clients stay locked out until a development site launches, so
						// the choice the paid flow offers is not offered here.
						is_fully_managed_agency_site: true,
					} )
				);
				// There is no pending site to provision against.
				expect( body.id ).toBeUndefined();
				return true;
			} )
			.reply( 200, {
				site: {
					id: 42,
					title: 'Rambling Thoughts',
					url: 'http://ramblingthoughts.wpcomstaging.com',
				},
			} );

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( closeModal ).toHaveBeenCalled();
		// The response is the only place a development site's id comes from.
		await waitFor( () => expect( getProvisioningSiteIds() ).toEqual( [ 42 ] ) );
	} );

	// This modal owns its own <Modal>, so it is the one that has to stay put:
	// closing mid-creation would leave the site landing server-side with nothing
	// left to redirect, track it or say how it went.
	test( 'cannot be dismissed while the site is being created', async () => {
		mockAgency();
		mockAddressSuggestion( 'ramblingthoughts' );
		const closeModal = jest.fn();
		render( <DevSiteConfigurationModal closeModal={ closeModal } /> );
		const user = userEvent.setup();

		await waitForSuggestedAddress();
		expect( screen.getByRole( 'button', { name: 'Close' } ) ).toBeVisible();

		nock( API )
			.post( '/wpcom/v2/agency/1/sites/provision-dev-site' )
			.delay( 200 )
			.reply( 200, {
				site: {
					id: 42,
					title: 'Rambling Thoughts',
					url: 'http://ramblingthoughts.wpcomstaging.com',
				},
			} );

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		await waitFor( () =>
			expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument()
		);
		await user.keyboard( '{Escape}' );
		expect( closeModal ).not.toHaveBeenCalled();

		await waitFor( () => expect( closeModal ).toHaveBeenCalled() );
	} );

	// Cancel records the close event itself; the X, Esc and a click outside all
	// route through onRequestClose, which has to record it too.
	test( 'records the close event however the modal is dismissed', async () => {
		mockAgency();
		mockAddressSuggestion( 'ramblingthoughts' );
		const closeModal = jest.fn();
		const { recordTracksEvent } = render( <DevSiteConfigurationModal closeModal={ closeModal } /> );
		const user = userEvent.setup();
		const closeEvents = () =>
			jest
				.mocked( recordTracksEvent )
				.mock.calls.filter( ( [ name ] ) => name === 'calypso_a4a_create_site_config_close' );

		await waitForSuggestedAddress();

		// Escape is handled on the modal overlay, so it only counts from inside.
		screen.getByRole( 'button', { name: 'Cancel' } ).focus();
		await user.keyboard( '{Escape}' );
		await waitFor( () => expect( closeEvents() ).toHaveLength( 1 ) );

		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () => expect( closeEvents() ).toHaveLength( 2 ) );

		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( closeEvents() ).toHaveLength( 3 );

		expect( closeModal ).toHaveBeenCalledTimes( 3 );
	} );

	// Same as the paid flow: the address is only claimed by the creation itself,
	// so a failure there has to send it back for a check.
	test( 're-checks the suggested address when creating the site rejects it', async () => {
		mockAgency();
		nock( API )
			.persist()
			.get( '/wpcom/v2/site-suggestions' )
			.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
		// The title seeds the address; the address then seeds the alternative.
		nock( API )
			.persist()
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( { query } ) => query === 'rambling thoughts' )
			.reply( 200, [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );
		nock( API )
			.persist()
			.get( '/rest/v1.1/domains/suggestions' )
			.query( ( { query } ) => query === 'ramblingthoughts' )
			.reply( 200, [ { domain_name: 'ramblingthoughts2.wordpress.com' } ] );
		nock( API )
			.persist()
			.post( '/wpcom/v2/agency/1/validate-site-address' )
			.reply( 200, { valid: false } );
		nock( API )
			.post( '/wpcom/v2/agency/1/sites/provision-dev-site' )
			.reply( 400, { message: 'Sorry, that site address is unavailable.' } );

		render( <DevSiteConfigurationModal closeModal={ jest.fn() } /> );
		const user = userEvent.setup();

		await waitForSuggestedAddress();

		await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );

		expect(
			await screen.findByRole( 'button', { name: 'ramblingthoughts2' }, { timeout: 3000 } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
		expect( getProvisioningSiteIds() ).toEqual( [] );
	} );
} );
