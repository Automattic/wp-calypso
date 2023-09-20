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
					product_cost: 144,
					meta: '',
					cost: 144,
					currency: 'BRL',
					volume: 1,
					free_trial: false,
					cost_before_coupon: 144,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost: 144,
					item_original_cost_integer: 14400,
					item_original_cost_display: 'R$144',
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					item_tax: 0,
					item_total: 144,
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
			coupon_savings_total: 0,
			coupon_savings_total_display: '0',
			coupon_savings_total_integer: 0,
			is_coupon_applied: true,
			sub_total: '144',
			sub_total_display: 'R$144',
			sub_total_integer: 14400,
			total_tax: '5',
			total_tax_display: 'R$5',
			total_tax_integer: 500,
			total_cost: 149,
			total_cost_display: 'R$149',
			total_cost_integer: 14900,
			currency: 'BRL',
			credits: 100,
			credits_integer: 10000,
			credits_display: 'R$100',
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
			coupon: 'fakecoupon',
			coupon_discounts_integer: [],
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has a total property', function () {
			expect( clientCart.total.amount ).toBeDefined();
		} );
		it( 'has the expected total value', function () {
			expect( clientCart.total.amount.value ).toBe( 14900 );
		} );
		it( 'has the expected currency', function () {
			expect( clientCart.total.amount.currency ).toBe( 'BRL' );
		} );
		it( 'has the expected total display value', function () {
			expect( clientCart.total.amount.displayValue ).toBe( 'R$149' );
		} );
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
					product_cost: 144,
					meta: '',
					cost: 144,
					currency: 'BRL',
					volume: 1,
					free_trial: false,
					cost_before_coupon: 144,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost: 144,
					item_original_cost_integer: 14400,
					item_original_cost_display: 'R$144',
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					item_tax: 0,
					item_total: 144,
					subscription_id: 0,
					uuid: '0',
				},
				{
					product_id: 106,
					product_name: '.cash Domain Registration',
					product_name_en: '.cash Domain Registration',
					product_slug: 'dotcash_domain',
					product_cost: 88,
					meta: 'foo.cash',
					cost: 0,
					currency: 'BRL',
					volume: 1,
					free_trial: false,
					cost_before_coupon: 88,
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
					item_original_cost: 88,
					item_original_cost_integer: 8800,
					item_original_cost_display: 'R$88',
					item_subtotal: 0,
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					item_tax: 0,
					item_total: 0,
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
			coupon_savings_total: 88,
			coupon_savings_total_display: '- R$88',
			coupon_savings_total_integer: 8800,
			is_coupon_applied: false,
			credits: 0,
			credits_integer: 0,
			credits_display: '0',
			sub_total: '144',
			sub_total_display: 'R$144',
			sub_total_integer: 14400,
			total_tax: '5',
			total_tax_display: 'R$5',
			total_tax_integer: 500,
			total_cost: 149,
			total_cost_display: 'R$149',
			total_cost_integer: 14900,
			currency: 'BRL',
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
			coupon_discounts_integer: [],
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has a total property', function () {
			expect( clientCart.total.amount ).toBeDefined();
		} );
		it( 'has the expected total value', function () {
			expect( clientCart.total.amount.value ).toBe( 14900 );
		} );
		it( 'has the expected currency', function () {
			expect( clientCart.total.amount.currency ).toBe( 'BRL' );
		} );
		it( 'has the expected total display value', function () {
			expect( clientCart.total.amount.displayValue ).toBe( 'R$149' );
		} );
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
					product_cost: 144,
					meta: '',
					cost: 144,
					currency: 'USD',
					volume: 1,
					free_trial: false,
					cost_before_coupon: 144,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost: 144,
					item_original_cost_integer: 14400,
					item_original_cost_display: 'R$144',
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_subtotal_display: '$144',
					item_tax: 0,
					item_total: 144,
					subscription_id: 0,
					uuid: '0',
				},
				{
					product_id: 106,
					product_name: '.cash Domain Registration',
					product_name_en: '.cash Domain Registration',
					product_slug: 'dotcash_domain',
					product_cost: 88,
					meta: 'foo.cash',
					cost: 0,
					currency: 'USD',
					volume: 1,
					free_trial: false,
					cost_before_coupon: 88,
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
					item_original_cost: 88,
					item_original_cost_integer: 8800,
					item_original_cost_display: 'R$88',
					item_subtotal: 0,
					item_subtotal_integer: 0,
					item_subtotal_display: '$0',
					item_tax: 0,
					item_total: 0,
					subscription_id: 0,
					uuid: '1',
				},
				{
					product_id: 69,
					product_name: 'G Suite',
					product_name_en: 'G Suite',
					product_slug: 'gapps',
					product_cost: 72,
					meta: 'foo.cash',
					cost: 72,
					currency: 'USD',
					volume: 2,
					free_trial: false,
					cost_before_coupon: null,
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
					item_original_cost: 72,
					item_original_cost_integer: 7200,
					item_original_cost_display: 'R$72',
					item_subtotal: 72,
					item_subtotal_integer: 7200,
					item_subtotal_display: '$72',
					item_tax: 0,
					item_total: 72,
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
			coupon_savings_total: 88,
			coupon_savings_total_display: '- R$88',
			coupon_savings_total_integer: 8800,
			is_coupon_applied: false,
			credits: 0,
			credits_integer: 0,
			credits_display: '0',
			sub_total: '216',
			sub_total_display: '$216',
			sub_total_integer: 21600,
			total_tax: '5',
			total_tax_display: '$5',
			total_tax_integer: 500,
			total_cost: 221,
			total_cost_display: '$221',
			total_cost_integer: 22100,
			currency: 'USD',
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
			coupon_discounts_integer: [],
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has a total property', function () {
			expect( clientCart.total.amount ).toBeDefined();
		} );
		it( 'has the expected total value', function () {
			expect( clientCart.total.amount.value ).toBe( 22100 );
		} );
		it( 'has the expected currency', function () {
			expect( clientCart.total.amount.currency ).toBe( 'USD' );
		} );
		it( 'has the expected total display value', function () {
			expect( clientCart.total.amount.displayValue ).toBe( '$221' );
		} );
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
					product_cost: 127,
					meta: '',
					cost: 127,
					currency: 'USD',
					volume: 1,
					free_trial: false,
					cost_before_coupon: 144,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_original_cost: 144,
					item_original_cost_integer: 14400,
					item_original_cost_display: '$144',
					item_subtotal_monthly_cost_integer: 1200,
					item_subtotal_monthly_cost_display: '$12',
					months_per_bill_period: 12,
					item_subtotal: 127,
					item_subtotal_integer: 12700,
					item_subtotal_display: '$127',
					item_tax: 0,
					item_total: 127,
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
			coupon_savings_total: 17,
			coupon_savings_total_display: '$17',
			coupon_savings_total_integer: 1700,
			sub_total: '127',
			sub_total_display: '$127',
			sub_total_integer: 12700,
			total_tax: '5',
			total_tax_display: '$5',
			total_tax_integer: 500,
			total_cost: 132,
			total_cost_display: '$132',
			total_cost_integer: 13200,
			currency: 'USD',
			credits: 100,
			credits_integer: 10000,
			credits_display: '$100',
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
			coupon: 'fakecoupon',
			coupon_discounts_integer: { 1009: 1700 },
			is_coupon_applied: true,
		};

		const clientCart = translateResponseCartToWPCOMCart( serverResponse );

		it( 'has a total property', function () {
			expect( clientCart.total.amount ).toBeDefined();
		} );
		it( 'has the expected total value', function () {
			expect( clientCart.total.amount.value ).toBe( 13200 );
		} );
		it( 'has the expected currency', function () {
			expect( clientCart.total.amount.currency ).toBe( 'USD' );
		} );
		it( 'has the expected total display value', function () {
			expect( clientCart.total.amount.displayValue ).toBe( '$132' );
		} );
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
