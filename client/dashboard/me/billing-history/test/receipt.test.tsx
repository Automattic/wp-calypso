/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { BillingDetailsField } from '../receipt';
import type { Receipt } from '@automattic/api-core';

const receipt = {
	id: 1,
	cc_num: '1234',
	cc_name: 'Jane Doe',
	cc_email: 'jane@example.com',
} as Receipt;

describe( '<BillingDetailsField>', () => {
	test( 'renders a multi-line field prefilled with the cardholder name and email', () => {
		render( <BillingDetailsField receipt={ receipt } /> );

		const field = screen.getByRole( 'textbox', { name: 'Billing details' } );
		expect( field.tagName ).toBe( 'TEXTAREA' );
		expect( field ).toHaveValue( 'Jane Doe\njane@example.com' );
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
