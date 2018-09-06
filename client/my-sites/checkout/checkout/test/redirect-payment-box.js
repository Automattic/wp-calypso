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

/**
 * Internal dependencies
 */
import { RedirectPaymentBox } from '../redirect-payment-box';
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
	translate: x => x,
} ) );

jest.mock( '../terms-of-service', () => {
	const react = require( 'react' );
	return class TermsOfService extends react.Component {};
} );
jest.mock( '../payment-chat-button', () => {
	const react = require( 'react' );
	return class PaymentChatButton extends react.Component {};
} );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

const defaultProps = {
	cart: {},
	translate: identity,
	countriesList: [
		{
			code: 'US',
			name: 'United States',
		},
		{
			code: 'AR',
			name: 'Argentina',
		},
	],
	paymentType: 'default',
	transaction: identity,
	redirectTo: 'http://here',
};

describe( 'RedirectPaymentBox', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const wrapper = shallow( <RedirectPaymentBox { ...defaultProps } /> );
		expect( wrapper.find( '.checkout__payment-box-section' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.checkout__payment-box-actions' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'TermsOfService' ) ).toHaveLength( 1 );
	} );

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
			const wrapper = shallow( <RedirectPaymentBox { ...props } /> );
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
			const wrapper = shallow( <RedirectPaymentBox { ...props } /> );
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
			const wrapper = shallow( <RedirectPaymentBox { ...props } /> );
			expect( wrapper.find( 'PaymentChatButton' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'Brazil TEF payments', () => {
		test( 'should render fields required for Brazil TEF', () => {
			const props = {
				...defaultProps,
				paymentType: 'brazil-tef',
			};
			const wrapper = shallow( <RedirectPaymentBox { ...props } /> );
			expect( wrapper.find( '[name="tef-bank"]' ) ).toHaveLength( 1 );
			expect( wrapper.find( 'EbanxPaymentFields' ) ).toHaveLength( 1 );
		} );
	} );
} );
