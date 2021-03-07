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
	let FR_DOMAIN_REGISTRATION_PRODUCT;
	let PREMIUM_PRODUCT;
	let THEME_PRODUCT;

	beforeAll( () => {
		DOMAIN_REGISTRATION_PRODUCT = cartItems.domainRegistration( {
			productSlug: 'dotcom_domain',
			domain: 'testdomain.com',
		} );
		FR_DOMAIN_REGISTRATION_PRODUCT = cartItems.domainRegistration( {
			productSlug: 'dotfr_domain',
			domain: 'testdomain.fr',
		} );
		PREMIUM_PRODUCT = cartItems.premiumPlan( 'value_bundle', { isFreeTrial: false } );
		THEME_PRODUCT = cartItems.themeItem( 'mood' );
	} );

	describe( 'cart change functions', () => {
		describe( 'flow( changeFunctions... )', () => {
			test( 'should combine multiple cart operations into a single step', () => {
				const addTwo = flow(
					cartItems.addCartItem( PREMIUM_PRODUCT ),
					cartItems.addCartItem( DOMAIN_REGISTRATION_PRODUCT )
				);

				const newCart = addTwo( cartValues.emptyCart( TEST_BLOG_ID ) );
				assert( cartItems.hasProduct( newCart, 'value_bundle' ) );
				assert( cartItems.hasProduct( newCart, 'dotcom_domain' ) );
			} );
		} );

		describe( 'cartItems.addCartItem( cartItem )', () => {
			test( 'should add the cartItem to the products array', () => {
				const initialCart = cartValues.emptyCart( TEST_BLOG_ID );
				const newCart = cartItems.addCartItem( PREMIUM_PRODUCT )( initialCart );
				const expectedCart = {
					blog_id: TEST_BLOG_ID,
					products: [ PREMIUM_PRODUCT ],
				};

				assert.deepEqual( newCart, expectedCart );
			} );
		} );

		describe( 'cartItems.remove( cartItem )', () => {
			test( 'should remove the cartItem from the products array', () => {
				const initialCart = {
					blog_id: TEST_BLOG_ID,
					products: [ PREMIUM_PRODUCT, DOMAIN_REGISTRATION_PRODUCT ],
				};
				const newCart = cartItems.remove( initialCart.products[ 0 ] )( initialCart );
				const expectedCart = {
					blog_id: TEST_BLOG_ID,
					products: [ DOMAIN_REGISTRATION_PRODUCT ],
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

	describe( 'cartItems.hasTld( cart, tld )', () => {
		test( 'should return a boolean that says whether a domain with the tld is in the cart items', () => {
			const cartWithFrTld = {
				blog_id: TEST_BLOG_ID,
				products: [ FR_DOMAIN_REGISTRATION_PRODUCT ],
			};
			const cartWithoutFrTld = {
				blog_id: TEST_BLOG_ID,
				products: [ DOMAIN_REGISTRATION_PRODUCT ],
			};

			assert( cartItems.hasTld( cartWithFrTld, 'fr' ) );
			assert( ! cartItems.hasTld( cartWithoutFrTld, 'fr' ) );
		} );
	} );

	describe( 'cartItems.hasOnlyProductsOf( cart, productSlug )', () => {
		test( 'should return a boolean that says whether only products of productSlug are in the cart items', () => {
			const cartWithMultipleProductSlugs = {
				blog_id: TEST_BLOG_ID,
				products: [ PREMIUM_PRODUCT, THEME_PRODUCT ],
			};

			assert( ! cartItems.hasOnlyProductsOf( cartWithMultipleProductSlugs, 'premium_theme' ) );

			const cartWithSameProductSlugs = {
				blog_id: TEST_BLOG_ID,
				products: [ THEME_PRODUCT, THEME_PRODUCT ],
			};

			assert( cartItems.hasOnlyProductsOf( cartWithSameProductSlugs, 'premium_theme' ) );

			const emptyCart = {};
			assert( ! cartItems.hasOnlyProductsOf( emptyCart, 'premium_theme' ) );
		} );
	} );

	describe( 'emptyCart( siteID )', () => {
		describe( 'returns a cart that', () => {
			test( 'should have the provided blog_id', () => {
				assert.equal( TEST_BLOG_ID, cartValues.emptyCart( TEST_BLOG_ID ).blog_id );
			} );

			test( 'should have no products', () => {
				assert.equal( 0, cartValues.emptyCart( TEST_BLOG_ID ).products.length );
			} );
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
