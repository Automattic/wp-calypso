/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal Dependencies
 */
import * as cartValues from '../index';
import * as cartItems from '../cart-items';

describe( 'index', () => {
	const TEST_BLOG_ID = 1;
	let DOMAIN_REGISTRATION_PRODUCT;
	let PREMIUM_PRODUCT;

	beforeAll( () => {
		DOMAIN_REGISTRATION_PRODUCT = cartItems.domainRegistration( {
			productSlug: 'dotcom_domain',
			domain: 'testdomain.com',
		} );
		PREMIUM_PRODUCT = cartItems.planItem( 'value_bundle', { isFreeTrial: false } );
	} );

	describe( 'cartItems.hasProduct( cart, productSlug )', () => {
		test( 'should return a boolean that says whether the product is in the cart items', () => {
			const cartWithPremium = {
				blog_id: TEST_BLOG_ID,
				products: [ PREMIUM_PRODUCT ],
			};
			assert( cartItems.hasProduct( cartWithPremium, 'value_bundle' ) );

			const cartWithoutPremium = {
				blog_id: TEST_BLOG_ID,
				products: [ DOMAIN_REGISTRATION_PRODUCT ],
			};
			assert( ! cartItems.hasProduct( cartWithoutPremium, PREMIUM_PRODUCT ) );
		} );
	} );
} );

describe( 'hasPendingPayment()', () => {
	test( 'return true if cart shows pending payment', () => {
		expect( cartValues.hasPendingPayment( { has_pending_payment: true } ) );
	} );
	test( 'return false if cart shows no pending payments', () => {
		expect( cartValues.hasPendingPayment( { has_pending_payment: false } ) ).toBe( false );
	} );
	test( 'return false if has_pending_payment is not set', () => {
		expect( cartValues.hasPendingPayment( { has_pending_payment: null } ) ).toBe( false );
		expect( cartValues.hasPendingPayment( {} ) ).toBe( false );
		expect( cartValues.hasPendingPayment( null ) ).toBe( false );
		expect( cartValues.hasPendingPayment( undefined ) ).toBe( false );
	} );
} );
