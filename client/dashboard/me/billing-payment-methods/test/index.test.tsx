/**
 * @vitest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PaymentMethods from '../index';
import type { StoredPaymentMethod } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

const card = {
	stored_details_id: '10',
	name: 'Jane Doe',
	payment_partner: 'stripe',
	payment_type: 'card',
	card_type: 'visa',
	card_last_4: '4242',
	expiry: '2030-01-31',
	is_expired: false,
	is_backup: false,
	email: '',
	tax_location: null,
} as unknown as StoredPaymentMethod;

function mockPaymentMethods( paymentMethods: StoredPaymentMethod[] ) {
	nock( API ).get( '/rest/v1.2/me/payment-methods' ).query( true ).reply( 200, paymentMethods );
}

describe( '<PaymentMethods>', () => {
	test( 'lists the payment methods with the toolbar and the header button', async () => {
		mockPaymentMethods( [ card ] );
		render( <PaymentMethods /> );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'Jane Doe' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.getAllByRole( 'button', { name: 'Add payment method' } ) ).toHaveLength( 1 );
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the existing event on the header button', async () => {
		mockPaymentMethods( [ card ] );
		const { recordTracksEvent } = render( <PaymentMethods /> );

		await screen.findByRole( 'table' );
		await userEvent.setup().click( screen.getByRole( 'button', { name: 'Add payment method' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_payment_method_add_click'
		);
	} );

	test( 'replaces the list and the header button when there are no payment methods', async () => {
		mockPaymentMethods( [] );
		const { recordTracksEvent } = render( <PaymentMethods /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Add your first payment method' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Pay for plans, domains, and renewals with a saved card.' )
		).toBeVisible();
		expect( screen.getByText( 'Save a credit or debit card to your account.' ) ).toBeVisible();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();

		// Only the next step is left, the header button is gone.
		const buttons = screen.getAllByRole( 'button', { name: 'Add payment method' } );
		expect( buttons ).toHaveLength( 1 );
		expect( buttons[ 0 ].closest( '.dashboard-empty-state__wrapper' ) ).not.toBeNull();

		await userEvent.setup().click( buttons[ 0 ] );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_payment_method_empty_state_action_click',
			{ action: 'add-payment-method' }
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_payment_method_add_click'
		);
	} );

	test( 'does not show an empty state while the payment methods load', async () => {
		let respond: () => void = () => {};
		const response = new Promise< void >( ( resolve ) => {
			respond = resolve;
		} );
		nock( API )
			.get( '/rest/v1.2/me/payment-methods' )
			.query( true )
			.reply( async () => {
				await response;
				return [ 200, [] ];
			} );
		render( <PaymentMethods /> );

		expect( await screen.findByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();

		respond();
		expect(
			await screen.findByRole( 'heading', { name: 'Add your first payment method' } )
		).toBeVisible();
	} );

	test( 'does not show an empty state when the payment methods fail to load', async () => {
		nock( API )
			.get( '/rest/v1.2/me/payment-methods' )
			.query( true )
			.reply( 500, { error: 'server_error' } );
		render( <PaymentMethods /> );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the toolbar and the header button when a search finds nothing', async () => {
		mockPaymentMethods( [ card ] );
		const user = userEvent.setup();
		render( <PaymentMethods /> );

		await screen.findByRole( 'table' );
		await user.type( screen.getByRole( 'searchbox' ), 'no such card' );

		expect(
			await screen.findByRole( 'heading', { name: 'No payment methods match your search' } )
		).toBeVisible();
		expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
	} );
} );
