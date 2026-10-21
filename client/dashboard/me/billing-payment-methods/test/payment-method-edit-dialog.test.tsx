/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { PaymentMethodEditDialog } from '../payment-method-edit-dialog';
import type { StoredPaymentMethod, StoredPaymentMethodTaxLocation } from '@automattic/api-core';

const paymentMethod = {
	stored_details_id: '12345',
	name: 'Test Cardholder',
	card_last_4: '4242',
	card_type: 'visa',
	payment_partner: 'stripe',
	tax_location: { country_code: 'US', postal_code: '43201' },
} as StoredPaymentMethod;

function renderDialog( {
	taxLocation,
	onConfirm = () => {},
}: {
	taxLocation?: StoredPaymentMethodTaxLocation;
	onConfirm?: ( updated: StoredPaymentMethod ) => void;
} = {} ) {
	return render(
		<PaymentMethodEditDialog
			paymentMethod={
				taxLocation ? { ...paymentMethod, tax_location: taxLocation } : paymentMethod
			}
			isVisible
			onCancel={ () => {} }
			onConfirm={ onConfirm }
		/>
	);
}

describe( '<PaymentMethodEditDialog>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-countries' ) )
			.reply( 200, [
				{ code: 'US', name: 'United States', has_postal_codes: true },
				{ code: 'FR', name: 'France', has_postal_codes: true },
			] )
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-states/' ) )
			.reply( 200, [] );
	} );

	test( 'offers the business use checkbox for an Ohio billing address', async () => {
		renderDialog();

		expect(
			await screen.findByRole( 'checkbox', { name: /is this purchase for business/i } )
		).toBeVisible();
	} );

	test( 'hides the business use checkbox for a billing address outside Ohio and Connecticut', async () => {
		renderDialog( { taxLocation: { country_code: 'US', postal_code: '94107' } } );

		await waitFor( () => expect( screen.getByLabelText( 'Postal code' ) ).toBeVisible() );
		expect(
			screen.queryByRole( 'checkbox', { name: /is this purchase for business/i } )
		).not.toBeInTheDocument();
	} );

	test( 'reflects a declaration already stored on the payment method', async () => {
		renderDialog( {
			taxLocation: { country_code: 'US', postal_code: '43201', is_for_business: true },
		} );

		expect(
			await screen.findByRole( 'checkbox', { name: /is this purchase for business/i } )
		).toBeChecked();
	} );

	test( 'saves a new declaration', async () => {
		const onConfirm = jest.fn();
		renderDialog( { onConfirm } );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: /is this purchase for business/i } )
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		expect( onConfirm ).toHaveBeenCalledWith(
			expect.objectContaining( {
				tax_location: expect.objectContaining( { is_for_business: true } ),
			} )
		);
	} );
} );
