/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SiteConfigurationModal from '../site-configuration-modal';

const API = 'https://public-api.wordpress.com';

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

function renderModal( onRequestClose = jest.fn() ) {
	render(
		<SiteConfigurationModal agencyId={ 1 } pendingSiteId={ 7 } onRequestClose={ onRequestClose } />
	);
	return { onRequestClose, user: userEvent.setup() };
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
	test( 'creates the site at the suggested address', async () => {
		mockAddressSuggestion( 'ramblingthoughts' );
		const { onRequestClose, user } = renderModal();

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
		expect( onRequestClose ).toHaveBeenCalled();
	} );

	test( 'keeps the agency fully managed when client access is turned off', async () => {
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
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
	} );

	test( 'rejects an address with unsupported characters', async () => {
		mockAddressSuggestion( 'ramblingthoughts' );
		const { user } = renderModal();

		const input = await screen.findByLabelText( 'Site address' );
		await waitFor( () => expect( input ).toHaveValue( 'ramblingthoughts' ) );

		await user.clear( input );
		await user.type( input, 'not valid' );

		expect(
			await screen.findByText( 'Your site address can only contain letters and numbers.' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeDisabled();
	} );
} );
