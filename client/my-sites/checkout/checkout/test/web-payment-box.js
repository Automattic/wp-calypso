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
import { setTaxCountryCode } from 'lib/upgrades/actions/cart';

jest.mock( 'config', () => {
	const configMock = jest.fn( i => i );
	configMock.isEnabled = jest.fn( () => true );
	return configMock;
} );

jest.mock( 'lib/upgrades/actions/cart' );

const mockStore = {
	subscribe: jest.fn(),
	dispatch: jest.fn(),
	getState: jest.fn(),
};

window.ApplePaySession = { canMakePayments: () => true };

const defaultCart = {
	currency: 'USD',
	total_cost: 12.34,
	products: [],
};

const defaultProps = {
	cart: defaultCart,
	translate: identity,
	countriesList: [ 'TEST' ],
	onSubmit: jest.fn(),
	transactionStep: { name: BEFORE_SUBMIT },
	transaction: {},
};

describe( 'WebPaymentBox', () => {
	test( 'should render', () => {
		shallow( <WebPaymentBox { ...defaultProps } /> );
	} );

	describe( 'Cart Store Integration', () => {
		test( 'Should update the store when the country is changed', () => {
			const wrapper = shallow( <WebPaymentBox { ...defaultProps } />, {
				context: { store: mockStore },
			} );

			const countrySelectWrapper = wrapper
				.find( PaymentCountrySelect )
				.dive() // unwrap Connect Call
				.dive(); // Activate underlying CountrySelect behaviour.

			countrySelectWrapper.simulate( 'change', { target: { value: 'TEST' } } );
			expect( setTaxCountryCode ).toHaveBeenCalledWith( 'TEST' );
		} );
	} );
} );
