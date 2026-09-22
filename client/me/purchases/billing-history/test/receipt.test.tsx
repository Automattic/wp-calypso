/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ReceiptDetails } from '../receipt';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

function makeTransaction( overrides: Partial< BillingTransaction > = {} ): BillingTransaction {
	return {
		id: '1',
		cc_num: 'XXXX',
		cc_name: '',
		cc_email: '',
		...overrides,
	} as BillingTransaction;
}

describe( '<ReceiptDetails>', () => {
	test( 'prefills the field with the cardholder name and email', () => {
		render(
			<ReceiptDetails
				transaction={ makeTransaction( {
					cc_num: '1234',
					cc_name: 'Jane Doe',
					cc_email: 'jane@example.com',
				} ) }
			/>
		);

		expect( screen.getByRole( 'textbox', { name: 'Billing details' } ) ).toHaveValue(
			'Jane Doe\njane@example.com'
		);
	} );

	test( 'renders an empty field for a receipt that was not paid by card', () => {
		render( <ReceiptDetails transaction={ makeTransaction() } /> );

		expect( screen.getByRole( 'textbox', { name: 'Billing details' } ) ).toHaveValue( '' );
	} );

	test( 'renders an empty field for a card receipt served without a name or email', () => {
		render( <ReceiptDetails transaction={ makeTransaction( { cc_num: '1234' } ) } /> );

		expect( screen.getByRole( 'textbox', { name: 'Billing details' } ) ).toHaveValue( '' );
	} );
} );
