/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

import { WebPaymentBox } from '../web-payment-box';
import { BEFORE_SUBMIT } from 'lib/store-transactions/step-types';
import PaymentCountrySelect from 'components/payment-country-select';
import { setTaxCountryCode, setTaxPostalCode } from 'lib/upgrades/actions/cart';

jest.mock( 'config', () => {
	const configMock = jest.fn( i => i );
	configMock.isEnabled = jest.fn( () => true );
	return configMock;
} );

jest.mock( 'lib/upgrades/actions/cart' );

jest.mock( 'lib/cart-values', () => ( {
	getTaxCountryCode: jest.fn( () => 'TEST_CART_COUNTRY_CODE' ),
	getTaxPostalCode: jest.fn( () => 'TEST_CART_POSTAL_CODE' ),
	cartItems: {
		hasRenewableSubscription: jest.fn(),
	},
} ) );

window.ApplePaySession = { canMakePayments: () => true };

describe( 'WebPaymentBox', () => {
	const defaultCart = {
		currency: 'USD',
		total_cost: 12.34,
		products: [],
		tax: {
			location: {
				'country-code': 'TEST_COUNTRY_CODE',
				'postal-code': '42',
			},
		},
	};

	const defaultProps = {
		cart: defaultCart,
		translate: identity,
		countriesList: [ 'TEST_COUNTRY_CODE' ],
		onSubmit: jest.fn(),
		transactionStep: { name: BEFORE_SUBMIT },
		transaction: {},
	};

	const context = {
		// mock Redux store to keep connect() calls happy
		store: {
			subscribe: jest.fn(),
			dispatch: jest.fn(),
			getState: jest.fn(),
		},
	};

	test( 'should render', () => {
		shallow( <WebPaymentBox { ...defaultProps } /> );
	} );

	describe( 'Cart Store Integration', () => {
		describe( 'Country Code', () => {
			const countrySelectWrapper = () =>
				shallow( <WebPaymentBox { ...defaultProps } />, { context } ).find( PaymentCountrySelect );

			test( 'Should render value from the cart store', () => {
				expect(
					countrySelectWrapper()
						.find( PaymentCountrySelect )
						.prop( 'value' )
				).toEqual( 'TEST_CART_COUNTRY_CODE' );
			} );

			test( 'Should update the store when changed', () => {
				countrySelectWrapper()
					.dive() // unwrap Connect Call
					.dive() // Activate underlying CountrySelect behaviour.
					.simulate( 'change', { target: { value: 'TEST' } } );

				expect( setTaxCountryCode ).toHaveBeenCalledWith( 'TEST' );
			} );
		} );

		describe( 'Postal Code', () => {
			const postalCodeInputWrapper = () =>
				shallow( <WebPaymentBox { ...defaultProps } />, { context } ).findWhere(
					n => n.prop( 'name' ) === 'postal-code'
				);

			test( 'Should render value from the cart store', () => {
				expect( postalCodeInputWrapper().prop( 'value' ) ).toEqual( 'TEST_CART_POSTAL_CODE' );
			} );

			test( 'Should update the store when changed', () => {
				postalCodeInputWrapper().simulate( 'change', {
					target: { name: 'postal-code', value: '54321' },
				} );
				expect( setTaxPostalCode ).toHaveBeenCalledWith( '54321' );
			} );
		} );
	} );
} );
