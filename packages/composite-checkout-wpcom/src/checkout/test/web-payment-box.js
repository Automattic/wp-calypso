/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { WebPaymentBox } from '../web-payment-box';
import PaymentCountrySelect from 'components/payment-country-select';
import { setTaxCountryCode, setTaxPostalCode } from 'lib/cart/actions';

jest.mock( 'config', () => {
	const configMock = jest.fn( ( i ) => i );
	configMock.isEnabled = jest.fn( () => true );
	return configMock;
} );

jest.mock( 'lib/cart/actions' );

// Mock some Redux-connected non-essential components to be empty
jest.mock( 'my-sites/checkout/checkout/recent-renewals', () => () => null );
jest.mock( 'my-sites/checkout/checkout/checkout-terms', () => () => null );

window.ApplePaySession = { canMakePayments: () => true };
window.PaymentRequest = true;

describe( 'WebPaymentBox', () => {
	const defaultCart = {
		currency: 'USD',
		total_cost: 12.34,
		products: [],
		tax: {
			location: {
				country_code: 'TEST_CART_COUNTRY_CODE',
				postal_code: 'TEST_CART_POSTAL_CODE',
			},
			display_taxes: true,
		},
	};

	const defaultProps = {
		cart: defaultCart,
		disablePostalCodeDebounce: true,
		translate: identity,
		countriesList: [ 'TEST_CART_COUNTRY_CODE' ],
		onSubmit: jest.fn(),
	};

	// mock Redux store to keep connect() calls happy
	const store = {
		subscribe: () => () => {},
		dispatch: () => {},
		getState: () => ( { ui: { checkout: { showCartOnMobile: false } } } ),
	};

	test( 'should render', () => {
		shallow( <WebPaymentBox { ...defaultProps } /> );
	} );

	describe( 'Cart Store Integration', () => {
		const webPaymentBoxWrapper = () =>
			mount( <WebPaymentBox { ...defaultProps } />, {
				wrappingComponent: Provider,
				wrappingComponentProps: { store },
			} );

		describe( 'Country Code', () => {
			const countrySelectWrapper = () => webPaymentBoxWrapper().find( PaymentCountrySelect );

			test( 'Should render value from the cart store', () => {
				expect( countrySelectWrapper().prop( 'value' ) ).toEqual( 'TEST_CART_COUNTRY_CODE' );
			} );

			test( 'Should update the store when changed', () => {
				countrySelectWrapper()
					.find( 'select' )
					.simulate( 'change', { target: { value: 'TEST' } } );

				expect( setTaxCountryCode ).toHaveBeenCalledWith( 'TEST' );
			} );
		} );

		describe( 'Postal Code', () => {
			const postalCodeInputWrapper = () =>
				webPaymentBoxWrapper().findWhere(
					( n ) => n.type() === 'input' && n.prop( 'name' ) === 'postal-code'
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
