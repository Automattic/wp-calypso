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
import { INPUT_VALIDATION } from 'lib/store-transactions/step-types';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

jest.mock( 'lib/cart-values', () => ( {
	isPaymentMethodEnabled: jest.fn( false ),
	paymentMethodName: jest.fn( false ),
	cartItems: {
		hasRenewableSubscription: jest.fn( false ),
		hasRenewalItem: jest.fn( false ),
	},
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

jest.mock( '../terms-of-service', () => {
	const react = require( 'react' );
	return class TermsOfService extends react.Component {};
} );
jest.mock( '../payment-chat-button', () => {
	const react = require( 'react' );
	return class PaymentChatButton extends react.Component {};
} );

jest.mock( 'lib/abtest', () => ( { abtest: () => {} } ) );
jest.mock( 'lib/cart-values', () => ( {
	cartItems: {
		hasRenewableSubscription: jest.fn( false ),
	},
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

jest.useFakeTimers();

describe( 'Credit Card Payment Box', () => {
	const defaultProps = {
		cards: [],
		transaction: {},
		cart: {},
		countriesList: [],
		initialCard: {},
		transactionStep: {},
		onSubmit: noop,
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
} );

describe( 'Credit Card Payment Box - PaymentChatButton', () => {
	const defaultProps = {
		cart: {},
		translate: identity,
	};

	const businessPlans = [ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ];

	businessPlans.forEach( product_slug => {
		test( 'should render PaymentChatButton if any WP.com business plan is in the cart', () => {
			const props = {
				...defaultProps,
				presaleChatAvailable: true,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <CreditCardPaymentBox { ...props } /> );
			expect( wrapper.find( 'PaymentChatButton' ) ).toHaveLength( 1 );
		} );
	} );

	businessPlans.forEach( product_slug => {
		test( 'should not render PaymentChatButton if presaleChatAvailable is false', () => {
			const props = {
				...defaultProps,
				presaleChatAvailable: false,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <CreditCardPaymentBox { ...props } /> );
			expect( wrapper.find( 'PaymentChatButton' ) ).toHaveLength( 0 );
		} );
	} );

	const otherPlans = [
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
		PLAN_FREE,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	];

	otherPlans.forEach( product_slug => {
		test( 'should not render PaymentChatButton if only non-business plan products are in the cart', () => {
			const props = {
				...defaultProps,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <CreditCardPaymentBox { ...props } /> );
			expect( wrapper.find( 'PaymentChatButton' ) ).toHaveLength( 0 );
		} );
	} );
} );
