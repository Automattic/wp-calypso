/**
 * External dependencies
 */
import assert from 'assert';
import { flow } from 'lodash';

describe( 'index', function() {
	const TEST_BLOG_ID = 1;
	let cartItems, cartValues, DOMAIN_REGISTRATION_PRODUCT, FR_DOMAIN_REGISTRATION_PRODUCT, PREMIUM_PRODUCT, THEME_PRODUCT;

	before( () => {
		cartValues = require( 'lib/cart-values' );
		cartItems = cartValues.cartItems;
		DOMAIN_REGISTRATION_PRODUCT = cartItems.domainRegistration( { productSlug: 'dotcom_domain', domain: 'testdomain.com' } );
		FR_DOMAIN_REGISTRATION_PRODUCT = cartItems.domainRegistration( { productSlug: 'dotfr_domain', domain: 'testdomain.fr' } );
		PREMIUM_PRODUCT = cartItems.premiumPlan( 'value_bundle', { isFreeTrial: false } );
		THEME_PRODUCT = cartItems.themeItem( 'mood' );
	} );

	describe( 'cart change functions', function() {
		describe( 'flow( changeFunctions... )', function() {
			it( 'should combine multiple cart operations into a single step', function() {
				var addTwo, newCart;

				addTwo = flow(
					cartItems.add( PREMIUM_PRODUCT ),
					cartItems.add( DOMAIN_REGISTRATION_PRODUCT )
				);

				newCart = addTwo( cartValues.emptyCart( TEST_BLOG_ID ) );
				assert( cartItems.hasProduct( newCart, 'value_bundle' ) );
				assert( cartItems.hasProduct( newCart, 'dotcom_domain' ) );
			} );
		} );

		describe( 'cartItems.add( cartItem )', function() {
			it( 'should add the cartItem to the products array', function() {
				var initialCart = cartValues.emptyCart( TEST_BLOG_ID ),
					newCart = cartItems.add( PREMIUM_PRODUCT )( initialCart ),
					expectedCart = {
						blog_id: TEST_BLOG_ID,
						products: [ PREMIUM_PRODUCT ]
					};

				assert.deepEqual( newCart, expectedCart );
			} );
		} );

		describe( 'cartItems.remove( cartItem )', function() {
			it( 'should remove the cartItem from the products array', function() {
				var initialCart, newCart, expectedCart;

				initialCart	= {
					blog_id: TEST_BLOG_ID,
					products: [ PREMIUM_PRODUCT, DOMAIN_REGISTRATION_PRODUCT ]
				};
				newCart = cartItems.remove( initialCart.products[ 0 ] )( initialCart );
				expectedCart = {
					blog_id: TEST_BLOG_ID,
					products: [ DOMAIN_REGISTRATION_PRODUCT ]
				};

				assert.deepEqual( newCart, expectedCart );
			} );
		} );
	} );

	describe( 'cartItems.hasProduct( cart, productSlug )', function() {
		it( 'should return a boolean that says whether the product is in the cart items', function() {
			var cartWithPremium, cartWithoutPremium;

			cartWithPremium = {
				blog_id: TEST_BLOG_ID,
				products: [ PREMIUM_PRODUCT ]
			};
			assert( cartItems.hasProduct( cartWithPremium, 'value_bundle' ) );

			cartWithoutPremium = {
				blog_id: TEST_BLOG_ID,
				products: [ DOMAIN_REGISTRATION_PRODUCT ]
			};
			assert( ! cartItems.hasProduct( cartWithoutPremium, PREMIUM_PRODUCT ) );
		} );
	} );

	describe( 'cartItems.hasTld( cart, tld )', function() {
		it( 'should return a boolean that says whether a domain with the tld is in the cart items', function() {
			const cartWithFrTld = {
					blog_id: TEST_BLOG_ID,
					products: [ FR_DOMAIN_REGISTRATION_PRODUCT ]
				}, cartWithoutFrTld = {
					blog_id: TEST_BLOG_ID,
					products: [ DOMAIN_REGISTRATION_PRODUCT ]
				};

			assert( cartItems.hasTld( cartWithFrTld, 'fr' ) );
			assert( ! cartItems.hasTld( cartWithoutFrTld, 'fr' ) );
		} );
	} );

	describe( 'cartItems.hasOnlyProductsOf( cart, productSlug )', function() {
		it( 'should return a boolean that says whether only products of productSlug are in the cart items', function() {
			var cartWithSameProductSlugs, cartWithMultipleProductSlugs, emptyCart;

			cartWithMultipleProductSlugs = {
				blog_id: TEST_BLOG_ID,
				products: [ PREMIUM_PRODUCT, THEME_PRODUCT ]
			};

			assert( ! cartItems.hasOnlyProductsOf( cartWithMultipleProductSlugs, 'premium_theme' ) );

			cartWithSameProductSlugs = {
				blog_id: TEST_BLOG_ID,
				products: [ THEME_PRODUCT, THEME_PRODUCT ]
			};

			assert( cartItems.hasOnlyProductsOf( cartWithSameProductSlugs, 'premium_theme' ) );

			emptyCart = {};
			assert( ! cartItems.hasOnlyProductsOf( emptyCart, 'premium_theme' ) );
		} );
	} );

	describe( 'emptyCart( siteID )', function() {
		describe( 'returns a cart that', function() {
			it( 'should have the provided blog_id', function() {
				assert.equal( TEST_BLOG_ID, cartValues.emptyCart( TEST_BLOG_ID ).blog_id );
			} );

			it( 'should have no products', function() {
				assert.equal( 0, cartValues.emptyCart( TEST_BLOG_ID ).products.length );
			} );
		} );
	} );
} );
