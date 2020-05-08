/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { WechatPaymentBox } from '../wechat-payment-box';
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
	cart: { total_cost: 100, products: [] },
	translate: ( x ) => x,
	countriesList: [
		{
			code: 'US',
			name: 'United States',
		},
		{
			code: 'CN',
			name: 'China',
		},
	],
	paymentType: 'default',
	transaction: {},
	redirectTo: ( x ) => x,
	selectedSite: { slug: 'example.com' },
	showErrorNotice: ( x ) => x,
	showInfoNotice: ( x ) => x,
	createRedirect: ( x ) => x,
	pending: false,
	failure: false,
	reset: ( x ) => x,
	redirectUrl: null,
	orderId: null,
	isMobile: false,
};

describe( 'WechatPaymentBox', () => {
	describe( 'contains', () => {
		const wrapper = shallow( <WechatPaymentBox { ...defaultProps } /> );

		// Tests correct usage of classes we've borrowed and depend on from CreditCardPaymentBox
		const rules = [
			'.checkout__payment-box-sections .checkout__payment-box-section [label="Your Name"]',
			'.checkout__payment-box-actions .payment-box__payment-buttons',
			'.payment-box__payment-buttons .pay-button .button.is-primary.button-pay.pay-button__button',
			'.payment-box__payment-buttons .checkout__secure-payment .checkout__secure-payment-content [icon="lock"]',
			'Localized(CheckoutTerms)',
			'Localized(SubscriptionText)',
			'Connect(CartToggle)',
			'Connect(Localized(CartCoupon))',
		];

		rules.forEach( ( rule ) => {
			test( rule, () => {
				expect( wrapper.find( rule ) ).toHaveLength( 1 );
			} );
		} );
	} );

	describe( 'PaymentChatButton', () => {
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
			test( 'renders if only non-business plan products are in the cart', () => {
				const props = {
					...defaultProps,
					cart: {
						products: [ { product_slug } ],
					},
				};
				const wrapper = shallow( <WechatPaymentBox { ...props } /> );
				expect( wrapper.find( 'Connect(Localized(PaymentChatButton))' ) ).toHaveLength( 0 );
			} );
		} );

		const eligiblePlans = [
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE,
			PLAN_ECOMMERCE_2_YEARS,
		];

		eligiblePlans.forEach( ( product_slug ) => {
			test( 'renders if any eligible WP.com plan is in the cart', () => {
				const props = {
					...defaultProps,
					presaleChatAvailable: true,
					cart: {
						products: [ { product_slug } ],
					},
				};
				const wrapper = shallow( <WechatPaymentBox { ...props } /> );

				expect( wrapper.find( 'Connect(Localized(PaymentChatButton))' ) ).toHaveLength( 1 );
			} );
		} );

		eligiblePlans.forEach( ( product_slug ) => {
			test( 'does not render if presaleChatAvailable is false', () => {
				const props = {
					...defaultProps,
					presaleChatAvailable: false,
					cart: {
						products: [ { product_slug } ],
					},
				};
				const wrapper = shallow( <WechatPaymentBox { ...props } /> );
				expect( wrapper.find( 'Connect(Localized(PaymentChatButton))' ) ).toHaveLength( 0 );
			} );
		} );
	} );

	describe( '#componentDidUpdate', () => {
		test( 'redirects on mobile', () => {
			// https://github.com/facebook/jest/issues/890#issuecomment-295939071
			window.location.assign = jest.fn();

			const redirectUrl = 'https://redirect';

			const instance = shallow(
				<WechatPaymentBox { ...defaultProps } redirectUrl={ redirectUrl } isMobile={ true } />
			).instance();

			instance.componentDidUpdate( Object.assign( {}, defaultProps, { pending: true } ) );

			expect( window.location.assign ).toHaveBeenCalledWith( redirectUrl );
		} );

		test( 'does not redirect on desktop', () => {
			window.location.assign = jest.fn();

			const redirectUrl = 'https://redirect';

			const instance = shallow(
				<WechatPaymentBox { ...defaultProps } redirectUrl={ redirectUrl } isMobile={ false } />
			).instance();

			instance.componentDidUpdate( Object.assign( {}, defaultProps, { pending: true } ) );

			expect( window.location.assign ).not.toHaveBeenCalledWith( redirectUrl );
		} );

		test( 'displays a qr code on desktop', () => {
			window.location.assign = jest.fn();

			const redirectUrl = 'https://redirect';

			const wrapper = shallow(
				<WechatPaymentBox { ...defaultProps } redirectUrl={ redirectUrl } isMobile={ false } />
			);

			expect( wrapper.find( 'Connect(Localized(WechatPaymentQRCode))' ) ).toHaveLength( 1 );
		} );
	} );
} );
