/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import CreditCard from '../index';
import { PARTNER_PAYPAL_EXPRESS } from '../../../lib/checkout/payment-methods';

describe( '<CreditCard>', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	test( 'displays the credit card information', () => {
		const { container } = render(
			<CreditCard
				card={ {
					lastDigits: '1234',
					cardType: 'visa',
					name: 'John Doe',
					expiry: '2030-01-30',
				} }
				selected
				onSelect={ jest.fn() }
				className="test-class-name"
			/>
		);

		expect( container.querySelector( '.credit-card__stored-card' ).firstChild ).toHaveStyle(
			`background-image: 'url(cc-visa.svg)'`
		);
		expect( container.querySelector( '.credit-card__stored-card-number' ) ).toHaveTextContent(
			'1234'
		);
		expect( container.querySelector( '.credit-card__stored-card-name' ) ).toHaveTextContent(
			'John Doe'
		);
		expect(
			container.querySelector( '.credit-card__stored-card-expiration-date' )
		).toHaveTextContent( 'Expires 01/30' );
	} );

	test( 'displays paypal agreements information', () => {
		const { container } = render(
			<CreditCard
				card={ {
					lastDigits: '',
					cardType: '',
					name: 'John Doe',
					expiry: '0000-00-00',
					email: 'mail@example.org',
					paymentPartner: PARTNER_PAYPAL_EXPRESS,
				} }
				selected
				className="test-class-name"
			/>
		);

		expect( container.querySelector( '.credit-card__stored-card' ).firstChild ).toHaveStyle(
			`background-image: 'url(paypal.svg)'`
		);
		expect( container.querySelector( '.credit-card__stored-card-number' ) ).toHaveTextContent(
			'mail@example.org'
		);
		expect( container.querySelector( '.credit-card__stored-card-name' ) ).toHaveTextContent(
			'John Doe'
		);
		expect(
			container.querySelector( '.credit-card__stored-card-expiration-date' )
		).toHaveTextContent( '' );
	} );

	test( 'handles click and keyPress events', () => {
		const handleSelect = jest.fn();
		const { container } = render(
			<CreditCard
				card={ {
					lastDigits: '1234',
					cardType: 'visa',
					name: 'John Doe',
					expiry: '2030-01-30',
				} }
				selected
				onSelect={ handleSelect }
				className="test-class-name"
			/>
		);
		const element = container.querySelector( '.test-class-name' );
		fireEvent.click( element );
		expect( handleSelect ).toHaveBeenCalledTimes( 1 );
		fireEvent.keyPress( element, { key: 'Enter', code: 13, charCode: 13 } );
		expect( handleSelect ).toHaveBeenCalledTimes( 2 );
	} );
} );
