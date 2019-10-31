/**
 * External dependencies
 */
import React from 'react';
import { render, getAllByLabelText } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { Checkout, CheckoutProvider } from '../../src';

test( 'When we enter checkout, the line items and total are rendered', () => {
	const MyCheckout = () => (
		<CheckoutProvider
			locale="en-us"
			items={ [
				{
					label: 'Illudium Q-36 Explosive Space Modulator',
					id: 'space-modulator',
					type: 'widget',
					amount: { currency: 'USD', value: 5500, displayValue: '$55' },
				},
				{
					label: 'Air Jordans',
					id: 'sneakers',
					type: 'apparel',
					amount: { currency: 'USD', value: 12000, displayValue: '$120' },
				},
			] }
			total={ {
				label: 'Total',
				id: 'total',
				type: 'total',
				amount: { currency: 'USD', value: 17500, displayValue: '$175' },
			} }
			onSuccess={ () => {
				return;
			} }
			onFailure={ () => {
				return;
			} }
			successRedirectUrl="#"
			failureRedirectUrl="#"
		>
			<Checkout />
		</CheckoutProvider>
	);
	const { container } = render( <MyCheckout /> );

	// Product line items show the correct price
	getAllByLabelText( container, 'Illudium Q-36 Explosive Space Modulator' ).map( element =>
		expect( element ).toHaveTextContent( '$55' )
	);
	getAllByLabelText( container, 'Air Jordans' ).map( element =>
		expect( element ).toHaveTextContent( '$120' )
	);

	// All elements labeled 'Total' show the expected price
	getAllByLabelText( container, 'Total' ).map( element =>
		expect( element ).toHaveTextContent( '$175' )
	);
} );
