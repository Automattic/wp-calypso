/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { BillingDetailsField, UserVatDetails } from '../receipt';
import type { Receipt } from '@automattic/api-core';

const receipt = {
	id: 1,
	cc_num: '1234',
	cc_name: 'Jane Doe',
	cc_email: 'jane@example.com',
} as Receipt;

const CURRENT_TAX_DETAILS = {
	country: 'IE',
	id: 'IE9999999',
	name: 'Renamed Since The Purchase Ltd',
	address: '2 New Street, Dublin',
	can_user_edit: true,
};

function makeReceipt( overrides: Partial< Receipt > = {} ): Receipt {
	return {
		id: 1,
		...overrides,
	} as Receipt;
}

function mockCurrentTaxDetails() {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/vat-info' )
		.query( true )
		.reply( 200, CURRENT_TAX_DETAILS );
}

describe( '<BillingDetailsField>', () => {
	test( 'renders a multi-line field prefilled with the cardholder name and email', () => {
		render( <BillingDetailsField receipt={ receipt } /> );

		const field = screen.getByRole( 'textbox', { name: 'Billing details' } );
		expect( field.tagName ).toBe( 'TEXTAREA' );
		expect( field ).toHaveValue( 'Jane Doe\njane@example.com' );
	} );

	test( 'renders an empty field for a receipt that was not paid by card', () => {
		render(
			<BillingDetailsField
				receipt={ makeReceipt( { cc_num: 'XXXX', cc_name: '', cc_email: '' } ) }
			/>
		);

		expect( screen.getByRole( 'textbox', { name: 'Billing details' } ) ).toHaveValue( '' );
	} );

	test( 'renders an empty field for a card receipt served without a name or email', () => {
		render(
			<BillingDetailsField
				receipt={ makeReceipt( { cc_num: '1234', cc_name: '', cc_email: '' } ) }
			/>
		);

		expect( screen.getByRole( 'textbox', { name: 'Billing details' } ) ).toHaveValue( '' );
	} );

	test( 'accepts line breaks typed by the user', async () => {
		const user = userEvent.setup();
		render( <BillingDetailsField receipt={ receipt } /> );

		const field = screen.getByRole( 'textbox', { name: 'Billing details' } );
		await user.clear( field );
		await user.type( field, 'Line one{Enter}Line two' );

		expect( field ).toHaveValue( 'Line one\nLine two' );
	} );

	test( 'mirrors the text into a printable area that preserves line breaks', async () => {
		const user = userEvent.setup();
		const { container } = render( <BillingDetailsField receipt={ receipt } /> );

		const field = screen.getByRole( 'textbox', { name: 'Billing details' } );
		await user.clear( field );
		await user.type( field, 'Line one{Enter}Line two' );

		const printable = container.querySelector( '.receipt-billing-details-printable' );
		expect( printable ).toHaveTextContent( 'Line one Line two' );
		expect( printable?.textContent ).toBe( 'Line one\nLine two' );
	} );
} );

describe( '<UserVatDetails>', () => {
	test( 'shows the tax identity the receipt was issued under, not the current one', async () => {
		mockCurrentTaxDetails();
		render(
			<UserVatDetails
				receipt={ makeReceipt( {
					tax_customer_info: {
						country: 'IE',
						id: 'IE1234567',
						name: 'Original Trading Name Ltd',
						address: '1 Old Street, Dublin',
					},
				} ) }
			/>
		);

		expect( await screen.findByText( 'Original Trading Name Ltd' ) ).toBeVisible();
		expect( screen.getByText( '1 Old Street, Dublin' ) ).toBeVisible();
		expect( screen.getByText( 'VAT #: IE IE1234567' ) ).toBeVisible();
		expect( screen.queryByText( 'Renamed Since The Purchase Ltd' ) ).not.toBeInTheDocument();
	} );

	test( 'falls back to the current tax identity for a receipt served without one', async () => {
		mockCurrentTaxDetails();
		render( <UserVatDetails receipt={ makeReceipt() } /> );

		expect( await screen.findByText( 'Renamed Since The Purchase Ltd' ) ).toBeVisible();
		expect( screen.getByText( 'VAT #: IE IE9999999' ) ).toBeVisible();
	} );

	test( 'shows nothing for a receipt issued to a customer with no tax identity', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/vat-info' )
			.query( true )
			.reply( 200, { country: '', id: null, name: null, address: null, can_user_edit: true } );

		render(
			<UserVatDetails
				receipt={ makeReceipt( {
					tax_customer_info: { country: '', id: null, name: null, address: null },
				} ) }
			/>
		);

		await waitFor( () => {
			expect( screen.queryByText( 'VAT Details' ) ).not.toBeInTheDocument();
		} );
	} );
} );
