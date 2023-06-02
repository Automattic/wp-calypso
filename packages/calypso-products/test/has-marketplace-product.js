import { hasMarketplaceProduct } from '../src/has-marketplace-product';

describe( 'hasMarketplaceProduct', () => {
	const productsList = {
		empty_product: {},
		product_with_wrong_types: { product_type: 1, slug: 1 },
		jetpack: { product_type: 'jetpack' },
		woocommerce_bookings_monthly: {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-bookings',
		},
		woocommerce_bookings_yearly: {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-bookings',
		},
		woocommerce_bookings_2y: {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-bookings',
		},
		'woocommerce-subscriptions-monthly': {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-subscriptions',
		},
		'woocommerce-subscriptions-yearly': {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-subscriptions',
		},
		'woocommerce-subscriptions-2y': {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-subscriptions',
		},
		'woocommerce-test-plugin': {
			product_type: 'plugin',
			billing_product_slug: 'woocommerce-test-plugin',
		},
		'woocommerce-test-plugin-advanced': {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'woocommerce-test-plugin-advanced',
		},
		wc_store_products_usually_underscored: {
			product_type: 'marketplace_plugin',
			billing_product_slug: 'wc-billing-product-slug-can-differ',
		},
	};

	test( "should return false when the product isn't in the products list", () => {
		expect( hasMarketplaceProduct( productsList, 'yoast' ) ).toBe( false );
	} );

	test( 'should return false when the a product is empty', () => {
		expect( hasMarketplaceProduct( productsList, 'empty_product' ) ).toBe( false );
	} );

	test( 'should return false when the a product has different types', () => {
		expect( hasMarketplaceProduct( productsList, 'product_with_wrong_types' ) ).toBe( false );
	} );

	test( "should return false when the product isn't a marketplace product", () => {
		expect( hasMarketplaceProduct( productsList, 'jetpack' ) ).toBe( false );
	} );

	test( 'should return false when a product slug also partly matches a marketplace product', () => {
		expect( hasMarketplaceProduct( productsList, 'woocommerce-test-plugin' ) ).toBe( false );
	} );

	test( "should return true when the billing_product_slug matches even when key doesn't match", () => {
		expect( hasMarketplaceProduct( productsList, 'wc-billing-product-slug-can-differ' ) ).toBe(
			true
		);
	} );

	describe( 'product is a marketplace product', () => {
		test( 'should return true when the product slug contains dashes', () => {
			expect( hasMarketplaceProduct( productsList, 'woocommerce-subscriptions' ) ).toBe( true );
		} );

		test( 'should return true when the product slug if suffixed with `monthly`', () => {
			expect( hasMarketplaceProduct( productsList, 'woocommerce_bookings_monthly' ) ).toBe( true );
			expect( hasMarketplaceProduct( productsList, 'woocommerce-subscriptions-monthly' ) ).toBe(
				true
			);
		} );

		test( 'should return true when the product slug if suffixed with `yearly`', () => {
			expect( hasMarketplaceProduct( productsList, 'woocommerce_bookings_yearly' ) ).toBe( true );
			expect( hasMarketplaceProduct( productsList, 'woocommerce-subscriptions-yearly' ) ).toBe(
				true
			);
		} );

		test( 'should return true when the product slug if suffixed with `2y`', () => {
			expect( hasMarketplaceProduct( productsList, 'woocommerce_bookings_2y' ) ).toBe( true );
			expect( hasMarketplaceProduct( productsList, 'woocommerce-subscriptions-2y' ) ).toBe( true );
		} );
	} );
} );
