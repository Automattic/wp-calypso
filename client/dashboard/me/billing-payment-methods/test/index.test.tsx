/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PaymentMethods from '../index';
import type { StoredPaymentMethod } from '@automattic/api-core';

// Importing the real route module pulls the whole router tree into the suite
// for the sake of one route constant.
jest.mock( '../../../app/router/me', () => ( {
	addPaymentMethodRoute: { to: '/me/billing/payment-methods/add' },
} ) );

const storedDetailsId = '12345';

const mockPaymentMethod = {
	stored_details_id: storedDetailsId,
	name: 'Test Cardholder',
	payment_partner: 'stripe',
	card_type: 'visa',
	card_last_4: '4242',
	is_backup: false,
	is_expired: false,
	expiry: '2030-01-01',
} as unknown as StoredPaymentMethod;

function mockPaymentMethods() {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/payment-methods' )
		.query( true )
		.reply( 200, [ mockPaymentMethod ] );
}

function mockPurchases() {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, [] );
}

function mockDelete( status = 200, body: object = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.1/me/stored-cards/${ storedDetailsId }/delete` )
		.reply( status, body );
}

const expectedProperties = {
	payment_partner: 'stripe',
	is_backup: false,
	is_expired: false,
};

async function openRemoveDialog( user: ReturnType< typeof userEvent.setup > ) {
	await waitFor( () => expect( screen.getByText( '****4242' ) ).toBeVisible() );

	await user.click( screen.getByRole( 'button', { name: 'Actions' } ) );
	await user.click( screen.getByRole( 'menuitem', { name: 'Remove payment method' } ) );
}

async function confirmRemoveDialog( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( screen.getByRole( 'button', { name: 'Remove payment method' } ) );
}

describe( 'PaymentMethods', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	test( 'records a Tracks event when a payment method is deleted', async () => {
		const user = userEvent.setup();
		mockPaymentMethods();
		mockPurchases();
		mockDelete();

		const { recordTracksEvent } = render( <PaymentMethods /> );

		await openRemoveDialog( user );
		await confirmRemoveDialog( user );

		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_payment_method_delete',
				expectedProperties
			);
		} );
	} );

	test( 'records a Tracks event when deleting a payment method fails', async () => {
		const user = userEvent.setup();
		mockPaymentMethods();
		mockPurchases();
		mockDelete( 500, { message: 'Network error' } );

		const { recordTracksEvent } = render( <PaymentMethods /> );

		await openRemoveDialog( user );
		await confirmRemoveDialog( user );

		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_payment_method_delete_failure',
				expect.objectContaining( {
					...expectedProperties,
					error_message: expect.any( String ),
				} )
			);
		} );
	} );
} );
