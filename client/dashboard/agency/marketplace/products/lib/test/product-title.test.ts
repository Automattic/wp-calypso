import { getProductShortTitle, getProductTitle } from '../product-title';
import type { AgencyProduct } from '@automattic/api-core';

const product = ( name: string, family_slug = 'jetpack-products' ): AgencyProduct => ( {
	name,
	slug: 'slug',
	product_id: 1,
	currency: 'USD',
	family_slug,
} );

describe( 'getProductTitle', () => {
	test( 'strips the brand and parentheses', () => {
		expect( getProductTitle( 'Jetpack VaultPress Backup (10GB)' ) ).toBe(
			'VaultPress Backup 10GB'
		);
		expect( getProductTitle( 'Jetpack Stats (Paid)' ) ).toBe( 'Stats' );
		expect( getProductTitle( 'Jetpack AI Assistant' ) ).toBe( 'AI' );
	} );

	test( 'drops the size variant when asked', () => {
		expect( getProductTitle( 'Jetpack Security (1TB)', true ) ).toBe( 'Security' );
		expect( getProductTitle( 'Jetpack VaultPress Backup (1TB)', true ) ).toBe(
			'VaultPress Backup'
		);
	} );
} );

describe( 'getProductShortTitle', () => {
	test( 'strips the vendor from WooCommerce and Pressable products', () => {
		expect(
			getProductShortTitle( product( 'WooCommerce Bookings', 'woocommerce-products' ) )
		).toBe( 'Bookings' );
		expect( getProductShortTitle( product( 'Pressable 10 Sites', 'pressable-addon' ) ) ).toBe(
			'10 Sites'
		);
	} );

	test( 'reduces backup storage add-ons to their size', () => {
		expect(
			getProductShortTitle(
				product( 'Jetpack VaultPress Backup Add-on Storage (100GB)', 'jetpack-backup-storage' )
			)
		).toBe( '100GB' );
	} );
} );
