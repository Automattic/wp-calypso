import { translateResponseCartToWPCOMCart } from '../lib/translate-cart';

describe( 'translateResponseCartToWPCOMCart', function () {
	describe( 'Cart with one plan only (BRL)', function () {
		const serverResponse = {
			blog_id: 123,
			products: [
				{
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_name_en: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					meta: '',
					cost: 144,
					currency: 'BRL',
					volume: 1,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost_integer: 14400,
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_tax: 0,
					subscription_id: 0,
					uuid: '0',
				},
			],
			tax: {
				location: {},
				display_taxes: true,
			},
			locale: 'US',
			is_signup: false,
			coupon_savings_total_integer: 0,
			is_coupon_applied: true,
			sub_total_integer: 14400,
			total_tax: '5',
			total_tax_integer: 500,
			total_cost: 149,
			total_cost_integer: 14900,
			currency: 'BRL',
			credits: 100,
			credits_integer: 10000,
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
			coupon: 'fakecoupon',
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has an array of allowed payment methods', function () {
			expect( clientCart.allowedPaymentMethods ).toBeDefined();
		} );

		describe( 'allowed payment methods', function () {
			it( 'contains the expected slugs', function () {
				expect( clientCart.allowedPaymentMethods ).toStrictEqual( [ 'card', 'ebanx', 'web-pay' ] );
			} );
		} );
	} );

	describe( 'Cart with one plan and one bundled domain (BRL)', function () {
		const serverResponse = {
			blog_id: 123,
			products: [
				{
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_name_en: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					meta: '',
					cost: 144,
					currency: 'BRL',
					volume: 1,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost_integer: 14400,
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_tax: 0,
					subscription_id: 0,
					uuid: '0',
				},
				{
					product_id: 106,
					product_name: '.cash Domain Registration',
					product_name_en: '.cash Domain Registration',
					product_slug: 'dotcash_domain',
					meta: 'foo.cash',
					cost: 0,
					currency: 'BRL',
					volume: 1,
					extra: {
						privacy: true,
						context: 'signup',
						registrar: 'KS_RAM',
						domain_registration_agreement_url:
							'https://wordpress.com/automattic-domain-name-registration-agreement/',
						privacy_available: true,
					},
					bill_period: 365,
					is_domain_registration: true,
					time_added_to_cart: 1572551402,
					is_bundled: true,
					item_original_cost_integer: 8800,
					item_subtotal: 0,
					item_subtotal_integer: 0,
					item_tax: 0,
					subscription_id: 0,
					uuid: '1',
				},
			],
			tax: {
				location: {},
				display_taxes: true,
			},
			locale: 'US',
			is_signup: false,
			coupon_savings_total_integer: 8800,
			is_coupon_applied: false,
			credits: 0,
			credits_integer: 0,
			sub_total_integer: 14400,
			total_tax: '5',
			total_tax_integer: 500,
			total_cost: 149,
			total_cost_integer: 14900,
			currency: 'BRL',
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has an array of allowed payment methods', function () {
			expect( clientCart.allowedPaymentMethods ).toBeDefined();
		} );

		describe( 'allowed payment methods', function () {
			it( 'contains the expected slugs', function () {
				expect( clientCart.allowedPaymentMethods ).toStrictEqual( [ 'card', 'ebanx', 'web-pay' ] );
			} );
		} );
	} );

	describe( 'Cart with plan, domain, and GSuite', function () {
		const serverResponse = {
			blog_id: 123,
			products: [
				{
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_name_en: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					meta: '',
					cost: 144,
					currency: 'USD',
					volume: 1,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost_integer: 14400,
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_tax: 0,
					subscription_id: 0,
					uuid: '0',
				},
				{
					product_id: 106,
					product_name: '.cash Domain Registration',
					product_name_en: '.cash Domain Registration',
					product_slug: 'dotcash_domain',
					meta: 'foo.cash',
					cost: 0,
					currency: 'USD',
					volume: 1,
					extra: {
						privacy: true,
						context: 'signup',
						registrar: 'KS_RAM',
						domain_registration_agreement_url:
							'https://wordpress.com/automattic-domain-name-registration-agreement/',
						privacy_available: true,
					},
					bill_period: 365,
					is_domain_registration: true,
					time_added_to_cart: 1572551402,
					is_bundled: true,
					item_original_cost_integer: 8800,
					item_subtotal: 0,
					item_subtotal_integer: 0,
					item_tax: 0,
					subscription_id: 0,
					uuid: '1',
				},
				{
					product_id: 69,
					product_name: 'G Suite',
					product_name_en: 'G Suite',
					product_slug: 'gapps',
					meta: 'foo.cash',
					cost: 72,
					currency: 'USD',
					volume: 2,
					extra: {
						context: 'signup',
						google_apps_users: [
							{
								email: 'foo@foo.cash',
								firstname: 'First',
								lastname: 'User',
							},
							{
								email: 'bar@foo.cash',
								firstname: 'Second',
								lastname: 'User',
							},
						],
					},
					bill_period: '365',
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost_integer: 7200,
					item_subtotal: 72,
					item_subtotal_integer: 7200,
					item_tax: 0,
					subscription_id: 0,
					uuid: '2',
				},
			],
			tax: {
				location: {},
				display_taxes: true,
			},
			locale: 'US',
			is_signup: false,
			coupon_savings_total_integer: 8800,
			is_coupon_applied: false,
			credits: 0,
			credits_integer: 0,
			sub_total_integer: 21600,
			total_tax: '5',
			total_tax_integer: 500,
			total_cost: 221,
			total_cost_integer: 22100,
			currency: 'USD',
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has an array of allowed payment methods', function () {
			expect( clientCart.allowedPaymentMethods ).toBeDefined();
		} );

		describe( 'allowed payment methods', function () {
			it( 'contains the expected slugs', function () {
				expect( clientCart.allowedPaymentMethods ).toStrictEqual( [ 'card', 'ebanx', 'web-pay' ] );
			} );
		} );
	} );

	describe( 'Cart with one plan only plus a coupon (USD)', function () {
		const serverResponse = {
			blog_id: 123,
			products: [
				{
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_name_en: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					meta: '',
					cost: 127,
					currency: 'USD',
					volume: 1,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost_integer: 14400,
					months_per_bill_period: 12,
					item_subtotal: 127,
					item_subtotal_integer: 12700,
					item_tax: 0,
					subscription_id: 0,
					uuid: '0',
				},
			],
			tax: {
				location: {},
				display_taxes: true,
			},
			locale: 'US',
			is_signup: false,
			coupon_savings_total_integer: 1700,
			sub_total_integer: 12700,
			total_tax: '5',
			total_tax_integer: 500,
			total_cost: 132,
			total_cost_integer: 13200,
			currency: 'USD',
			credits: 100,
			credits_integer: 10000,
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
			coupon: 'fakecoupon',
			is_coupon_applied: true,
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has an array of allowed payment methods', function () {
			expect( clientCart.allowedPaymentMethods ).toBeDefined();
		} );

		describe( 'allowed payment methods', function () {
			it( 'contains the expected slugs', function () {
				expect( clientCart.allowedPaymentMethods ).toStrictEqual( [ 'card', 'ebanx', 'web-pay' ] );
			} );
		} );
	} );
} );
