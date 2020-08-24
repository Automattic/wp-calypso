/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { CreditsPaymentBox } from '../credits-payment-box';
import PaymentChatButton from '../payment-chat-button';
import CheckoutTerms from '../checkout-terms';
import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
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

const defaultProps = {
	cart: {},
	translate: identity,
};

describe( 'CreditsPaymentBox', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const wrapper = shallow( <CreditsPaymentBox { ...defaultProps } /> );
		expect( wrapper.find( '.payment-box-section' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.payment-box-actions' ) ).toHaveLength( 1 );
		expect( wrapper.find( CheckoutTerms ) ).toHaveLength( 1 );
	} );

	const eligiblePlans = [
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	];

	eligiblePlans.forEach( ( product_slug ) => {
		test( 'should render PaymentChatButton if any WP.com business plan is in the cart', () => {
			const props = {
				...defaultProps,
				presaleChatAvailable: true,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <CreditsPaymentBox { ...props } /> );
			expect( wrapper.find( PaymentChatButton ) ).toHaveLength( 1 );
		} );
	} );

	eligiblePlans.forEach( ( product_slug ) => {
		test( 'should not render PaymentChatButton if presaleChatAvailable is false', () => {
			const props = {
				...defaultProps,
				presaleChatAvailable: false,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <CreditsPaymentBox { ...props } /> );
			expect( wrapper.find( PaymentChatButton ) ).toHaveLength( 0 );
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

	otherPlans.forEach( ( product_slug ) => {
		test( 'should not render PaymentChatButton if only non-business plan products are in the cart', () => {
			const props = {
				...defaultProps,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <CreditsPaymentBox { ...props } /> );
			expect( wrapper.find( PaymentChatButton ) ).toHaveLength( 0 );
		} );
	} );
} );
