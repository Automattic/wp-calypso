/**
 * Internal dependencies
 */
import { translateWpcomCartToCheckoutCart } from '../src/lib/translate-cart';

describe( 'translateWpcomCartToCheckoutCart', function() {
	describe( 'Cart with one plan only (BRL)', function() {
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
					orig_cost: null,
					cost_before_coupon: 144,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					item_tax: 0,
					item_total: 144,
					subscription_id: 0,
				},
			],
			tax: [],
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
			credits_integer: 10000,
			allowed_payment_methods: [
				'WPCOM_Billing_Stripe_Payment_Method',
				'WPCOM_Billing_Ebanx',
				'WPCOM_Billing_Web_Payment',
			],
		};

		const clientCart = translateWpcomCartToCheckoutCart( serverResponse );

		it( 'has a total property', function() {
			expect( clientCart.total.amount ).toBeDefined();
		} );
		it( 'has the expected total value', function() {
			expect( clientCart.total.amount.value ).toBe( 14900 );
		} );
		it( 'has the expected currency', function() {
			expect( clientCart.total.amount.currency ).toBe( 'BRL' );
		} );
		it( 'has the expected total display value', function() {
			expect( clientCart.total.amount.displayValue ).toBe( 'R$149' );
		} );
		it( 'has an array of items', function() {
			expect( clientCart.items ).toBeDefined();
		} );
		it( 'has the expected number of line items', function() {
			expect( clientCart.items.length ).toBe( 1 );
		} );
		it( 'has an array of allowed payment methods', function() {
			expect( clientCart.allowedPaymentMethods ).toBeDefined();
		} );
		it( 'has the expected credits', function() {
			expect( clientCart.credits ).toBe( 10000 );
		} );

		describe( 'first cart item (plan)', function() {
			it( 'has an id', function() {
				expect( clientCart.items[ 0 ].id ).toBeDefined();
			} );
			it( 'has the expected label', function() {
				expect( clientCart.items[ 0 ].label ).toBe( 'WordPress.com Personal' );
			} );
			it( 'has the expected type', function() {
				expect( clientCart.items[ 0 ].type ).toBe( 'personal-bundle' );
			} );
			it( 'has the expected currency', function() {
				expect( clientCart.items[ 0 ].amount.currency ).toBe( 'BRL' );
			} );
			it( 'has the expected value', function() {
				expect( clientCart.items[ 0 ].amount.value ).toBe( 14400 );
			} );
			it( 'has the expected display value', function() {
				expect( clientCart.items[ 0 ].amount.displayValue ).toBe( 'R$144' );
			} );
		} );

		describe( 'taxes', function() {
			it( 'has an id', function() {
				expect( clientCart.tax.id ).toBeDefined();
			} );
			it( 'has the expected label', function() {
				expect( clientCart.tax.label ).toBe( 'Tax' );
			} );
			it( 'has the expected type', function() {
				expect( clientCart.tax.type ).toBe( 'tax' );
			} );
			it( 'has the expected currency', function() {
				expect( clientCart.tax.amount.currency ).toBe( 'BRL' );
			} );
			it( 'has the expected value', function() {
				expect( clientCart.tax.amount.value ).toBe( 500 );
			} );
			it( 'has the expected display value', function() {
				expect( clientCart.tax.amount.displayValue ).toBe( 'R$5' );
			} );
		} );

		describe( 'allowed payment methods', function() {
			it( 'contains the expected slugs', function() {
				expect( clientCart.allowedPaymentMethods ).toStrictEqual( [
					'card',
					'ebanx',
					'apple-pay',
				] );
			} );
		} );
	} );

	describe( 'Cart with one plan and one bundled domain (BRL)', function() {
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
					orig_cost: null,
					cost_before_coupon: 144,
					extra: {
						context: 'signup',
						domain_to_bundle: 'foo.cash',
					},
					bill_period: 365,
					is_domain_registration: false,
					time_added_to_cart: 1572551402,
					is_bundled: false,
					item_subtotal: 144,
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					item_tax: 0,
					item_total: 144,
					subscription_id: 0,
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
					orig_cost: 0,
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
					item_subtotal: 0,
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					item_tax: 0,
					item_total: 0,
					subscription_id: 0,
				},
			],
			tax: [],
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
		};

		const clientCart = translateWpcomCartToCheckoutCart( serverResponse );

		it( 'has a total property', function() {
			expect( clientCart.total.amount ).toBeDefined();
		} );
		it( 'has the expected total value', function() {
			expect( clientCart.total.amount.value ).toBe( 14900 );
		} );
		it( 'has the expected currency', function() {
			expect( clientCart.total.amount.currency ).toBe( 'BRL' );
		} );
		it( 'has the expected total display value', function() {
			expect( clientCart.total.amount.displayValue ).toBe( 'R$149' );
		} );
		it( 'has a list of items', function() {
			expect( clientCart.items ).toBeDefined();
		} );
		it( 'has the expected number of line items', function() {
			expect( clientCart.items.length ).toBe( 2 );
		} );
		it( 'has an array of allowed payment methods', function() {
			expect( clientCart.allowedPaymentMethods ).toBeDefined();
		} );

		describe( 'first cart item (plan)', function() {
			it( 'has an id', function() {
				expect( clientCart.items[ 0 ].id ).toBeDefined();
			} );
			it( 'has the expected label', function() {
				expect( clientCart.items[ 0 ].label ).toBe( 'WordPress.com Personal' );
			} );
			it( 'has the expected type', function() {
				expect( clientCart.items[ 0 ].type ).toBe( 'personal-bundle' );
			} );
			it( 'has the expected currency', function() {
				expect( clientCart.items[ 0 ].amount.currency ).toBe( 'BRL' );
			} );
			it( 'has the expected value', function() {
				expect( clientCart.items[ 0 ].amount.value ).toBe( 14400 );
			} );
			it( 'has the expected display value', function() {
				expect( clientCart.items[ 0 ].amount.displayValue ).toBe( 'R$144' );
			} );
		} );

		describe( 'second cart item (domain)', function() {
			it( 'has an id', function() {
				expect( clientCart.items[ 1 ].id ).toBeDefined();
			} );
			it( 'has the expected label', function() {
				expect( clientCart.items[ 1 ].label ).toBe( '.cash Domain Registration' );
			} );
			it( 'has the expected sublabel (the domain name)', function() {
				expect( clientCart.items[ 1 ].sublabel ).toBe( 'foo.cash' );
			} );
			it( 'has the expected type', function() {
				expect( clientCart.items[ 1 ].type ).toBe( 'dotcash_domain' );
			} );
			it( 'has the expected currency', function() {
				expect( clientCart.items[ 1 ].amount.currency ).toBe( 'BRL' );
			} );
			it( 'has the expected value', function() {
				expect( clientCart.items[ 1 ].amount.value ).toBe( 0 );
			} );
			it( 'has the expected display value', function() {
				expect( clientCart.items[ 1 ].amount.displayValue ).toBe( 'R$0' );
			} );
		} );

		describe( 'taxes', function() {
			it( 'has an id', function() {
				expect( clientCart.tax.id ).toBeDefined();
			} );
			it( 'has the expected label', function() {
				expect( clientCart.tax.label ).toBe( 'Tax' );
			} );
			it( 'has the expected type', function() {
				expect( clientCart.tax.type ).toBe( 'tax' );
			} );
			it( 'has the expected currency', function() {
				expect( clientCart.tax.amount.currency ).toBe( 'BRL' );
			} );
			it( 'has the expected value', function() {
				expect( clientCart.tax.amount.value ).toBe( 500 );
			} );
			it( 'has the expected display value', function() {
				expect( clientCart.tax.amount.displayValue ).toBe( 'R$5' );
			} );
		} );

		describe( 'allowed payment methods', function() {
			it( 'contains the expected slugs', function() {
				expect( clientCart.allowedPaymentMethods ).toStrictEqual( [
					'card',
					'ebanx',
					'apple-pay',
				] );
			} );
		} );
	} );
} );
