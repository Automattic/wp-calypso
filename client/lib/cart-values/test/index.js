/**
 * External dependencies
 */
import assert from 'assert';
import { flow } from 'lodash';

/**
 * Internal Dependencies
 */
import * as cartValues from '../index';
import * as cartItems from '../cart-items';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'calypso/lib/user', () => () => {} );

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

	describe( 'cart change functions', () => {
		describe( 'flow( changeFunctions... )', () => {
			test( 'should combine multiple cart operations into a single step', () => {
				const addTwo = flow(
					cartItems.addCartItem( PREMIUM_PRODUCT ),
					cartItems.addCartItem( DOMAIN_REGISTRATION_PRODUCT )
				);

				const newCart = addTwo( { blog_id: TEST_BLOG_ID, products: [] } );
				assert( cartItems.hasProduct( newCart, 'value_bundle' ) );
				assert( cartItems.hasProduct( newCart, 'dotcom_domain' ) );
			} );
		} );

		describe( 'cartItems.addCartItem( cartItem )', () => {
			test( 'should add the cartItem to the products array', () => {
				const initialCart = { blog_id: TEST_BLOG_ID, products: [] };
				const newCart = cartItems.addCartItem( PREMIUM_PRODUCT )( initialCart );
				const expectedCart = {
					blog_id: TEST_BLOG_ID,
					products: [ PREMIUM_PRODUCT ],
				};

				assert.deepEqual( newCart, expectedCart );
			} );
		} );
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
