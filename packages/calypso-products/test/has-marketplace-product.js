import { hasMarketplaceProduct } from '../src/has-marketplace-product';

describe( 'hasMarketplaceProduct', () => {
	const productsList = {
		jetpack: { product_type: 'jetpack' },
		woocommerce_bookings_monthly: { product_type: 'marketplace_plugin' },
		woocommerce_bookings_yearly: { product_type: 'marketplace_plugin' },
		woocommerce_bookings_2y: { product_type: 'marketplace_plugin' },
		'woocommerce-subscriptions-monthly': { product_type: 'marketplace_plugin' },
		'woocommerce-subscriptions-yearly': { product_type: 'marketplace_plugin' },
		'woocommerce-subscriptions-2y': { product_type: 'marketplace_plugin' },
		'woocommerce-test-plugin': { product_type: 'plugin' },
		'woocommerce-test-plugin-advanced': { product_type: 'marketplace_plugin' },
	};
	test( "should return false when the product isn't in the products list", () => {
		expect( hasMarketplaceProduct( productsList, 'yoast' ) ).toBe( false );
	} );

	test( "should return false when the product isn't a marketplace product", () => {
		expect( hasMarketplaceProduct( productsList, 'jetpack' ) ).toBe( false );
	} );

	test( 'should return false when a product slug also partly matches a marketplace product', () => {
		expect( hasMarketplaceProduct( productsList, 'woocommerce-test-plugin' ) ).toBe( false );
	} );

	describe( 'product is a marketplace product', () => {
		test( 'should return true when the product slug contains underscores', () => {
			expect( hasMarketplaceProduct( productsList, 'woocommerce_bookings' ) ).toBe( true );
		} );

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
