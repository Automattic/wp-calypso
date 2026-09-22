/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import ReferHosting from '../index';

const API = 'https://public-api.wordpress.com';

function mockApi( approval_status: 'pending' | 'approved' ) {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{
				id: 1,
				name: 'Test Agency',
				approval_status,
				created_at: new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 ).toISOString(),
			},
		] );
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
	nock( API )
		.persist()
		.get( '/wpcom/v2/woocommerce/countries/regions/' )
		.query( true )
		.reply( 200, { FR: 'France' } );
}

describe( '<ReferHosting>', () => {
	beforeEach( () => nock.cleanAll() );

	test( 'warns a pending agency above the Enterprise form', async () => {
		mockApi( 'pending' );

		render( <ReferHosting type="enterprise" /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Refer a client for WordPress VIP hosting' } )
		).toBeVisible();
		expect( await screen.findByText( /While we review your agency/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Submit VIP referral' } ) ).toBeVisible();
	} );

	test( 'thanks the agency and links back to the marketplace once the referral is sent', async () => {
		mockApi( 'approved' );
		nock( API )
			.post( '/wpcom/v2/agency/pressable/premium-plan-referral' )
			.reply( 200, { status: 'success', message: 'Form submitted successfully.' } );
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <ReferHosting type="premium" /> );

		await user.type( await screen.findByRole( 'textbox', { name: 'Company name' } ), 'Acme' );
		await user.type( screen.getByRole( 'textbox', { name: 'Company address' } ), '1 Main St' );
		await user.click( screen.getByRole( 'combobox', { name: 'Country' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'France' } ) );
		await user.type( screen.getByRole( 'textbox', { name: 'City' } ), 'Paris' );
		await user.type( screen.getByRole( 'textbox', { name: 'ZIP/Postal code' } ), '75001' );
		await user.type( screen.getByRole( 'textbox', { name: 'First name' } ), 'Ada' );
		await user.type( screen.getByRole( 'textbox', { name: 'Last name' } ), 'Lovelace' );
		await user.type( screen.getByRole( 'textbox', { name: 'Title' } ), 'CTO' );
		await user.type( screen.getByRole( 'textbox', { name: 'Email' } ), 'ada@example.com' );
		await user.type( screen.getByRole( 'textbox', { name: 'Website' } ), 'example.com' );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Tell us more about this opportunity' } ),
			'A big site.'
		);
		await user.click( screen.getByRole( 'button', { name: 'Submit Premium plan referral' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'Thank you for your Premium plan referral' } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Submit Premium plan referral' } )
		).not.toBeInTheDocument();

		const backLink = screen.getByRole( 'link', { name: 'Back to the marketplace' } );
		expect( backLink ).toHaveAttribute( 'href', '/marketplace/hosting/pressable' );
		await user.click( backLink );
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_a4a_marketplace_hosting_premium_refer_form_back_to_marketplace'
			)
		);
	} );
} );
