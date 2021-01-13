/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import PaymentInfoBlock from '../payment-info-block';

describe( 'PaymentInfoBlock', () => {
	it( 'renders "Credits" when the purchase was paid with credits', () => {
		const purchase = { payment: { type: 'credits' } };
		render( <PaymentInfoBlock purchase={ purchase } /> );
		expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'Credits' );
	} );
} );
