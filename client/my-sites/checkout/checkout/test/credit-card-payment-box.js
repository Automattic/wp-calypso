/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { CreditCardPaymentBox } from '../credit-card-payment-box';
import { isPayPalExpressEnabled } from 'lib/cart-values';
import { INPUT_VALIDATION } from 'lib/store-transactions/step-types';

jest.mock( 'lib/abtest', () => ( { abtest: () => {} } ) );
jest.mock( 'lib/analytics', () => {} );
jest.mock( 'lib/cart-values', () => ( {
	isPayPalExpressEnabled: jest.fn( false ),
	cartItems: {
		hasRenewableSubscription: jest.fn( false ),
	},
} ) );

jest.useFakeTimers();

describe( 'Credit Card Payment Box', () => {
	const defaultProps = {
		cards: [],
		transaction: {},
		cart: {},
		countriesList: {},
		initialCard: {},
		selectedSite: {},
		transactionStep: {},
		onSubmit: noop,
		onToggle: noop,
		translate: identity,
	};

	test( 'does not blow up with default props', () => {
		const wrapper = shallow( <CreditCardPaymentBox { ...defaultProps } /> );
		expect( wrapper ).toHaveLength( 1 );
	} );

	test( 'should set progress timer when incoming validation transaction step contains no errors', () => {
		const wrapper = shallow( <CreditCardPaymentBox { ...defaultProps } /> );
		const tickSpy = jest.spyOn( wrapper.instance(), 'tick' );
		wrapper.update();
		expect( wrapper.instance().timer ).toBe( null );
		wrapper.setProps( {
			transactionStep: {
				name: INPUT_VALIDATION,
			},
		} );
		jest.runOnlyPendingTimers();
		expect( wrapper.instance().timer ).not.toBe( null );
		expect( tickSpy.mock.calls.length ).toBe( 1 );
		expect( setInterval.mock.calls.length ).toBe( 1 );
		setInterval.mockClear();
	} );

	test( 'should not set progress timer when incoming validation transaction step contains errors', () => {
		const wrapper = shallow( <CreditCardPaymentBox { ...defaultProps } /> );
		const tickSpy = jest.spyOn( wrapper.instance(), 'tick' );
		wrapper.update();
		expect( wrapper.instance().timer ).toBe( null );
		wrapper.setProps( {
			transactionStep: {
				name: INPUT_VALIDATION,
				error: {},
			},
		} );
		jest.runOnlyPendingTimers();
		expect( wrapper.instance().timer ).toBe( null );
		expect( tickSpy.mock.calls.length ).toBe( 0 );
		expect( setInterval.mock.calls.length ).toBe( 0 );
		setInterval.mockClear();
	} );

	test( 'should clear progress timer when incoming validation transaction step contains errors ', () => {
		const wrapper = shallow( <CreditCardPaymentBox { ...defaultProps } /> );
		const tickSpy = jest.spyOn( wrapper.instance(), 'tick' );
		wrapper.update();
		expect( wrapper.instance().timer ).toBe( null );
		wrapper.setProps( {
			transactionStep: {
				name: INPUT_VALIDATION,
			},
		} );
		jest.runOnlyPendingTimers();
		expect( wrapper.instance().timer ).not.toBe( null );
		expect( tickSpy.mock.calls.length ).toBe( 1 );
		expect( setInterval.mock.calls.length ).toBe( 1 );
		wrapper.setProps( {
			transactionStep: {
				name: INPUT_VALIDATION,
				error: {},
			},
		} );
		jest.runOnlyPendingTimers();
		expect( wrapper.instance().timer ).toBe( null );
		expect( tickSpy.mock.calls.length ).toBe( 1 );
		expect( setInterval.mock.calls.length ).toBe( 1 );
		setInterval.mockClear();
	} );

	test( 'should display PayPal payment button when PayPal express is not enabled', () => {
		const wrapper = shallow( <CreditCardPaymentBox { ...defaultProps } /> );
		expect( wrapper.find( '.credit-card-payment-box__switch-link' ) ).toHaveLength( 0 );
	} );

	test( 'should display PayPal payment button when PayPal express is enabled', () => {
		isPayPalExpressEnabled.mockReturnValue( true );
		const wrapper = shallow( <CreditCardPaymentBox { ...defaultProps } /> );
		expect( wrapper.find( '.credit-card-payment-box__switch-link' ) ).toHaveLength( 1 );
	} );
} );
