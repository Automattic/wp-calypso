import {
	getProductBadgeLabels,
	getProductCategories,
	getProductFilterCategories,
} from '../product-categories';
import type { AgencyProduct } from '@automattic/api-core';

const product = ( slug: string, family_slug: string ): AgencyProduct => ( {
	name: slug,
	slug,
	product_id: 1,
	currency: 'USD',
	family_slug,
} );

describe( 'getProductFilterCategories', () => {
	test( 'lists Jetpack Complete under the categories it bundles, but not as badges', () => {
		const complete = product( 'jetpack-complete', 'jetpack-packs' );
		expect( getProductCategories( complete ) ).toEqual( [] );
		expect( getProductFilterCategories( complete ) ).toEqual( [
			'security',
			'performance',
			'social',
			'growth',
		] );
	} );

	test( 'matches the badge categories for everything else', () => {
		const scan = product( 'jetpack-scan', 'jetpack-products' );
		expect( getProductFilterCategories( scan ) ).toEqual( getProductCategories( scan ) );
	} );
} );

describe( 'getProductBadgeLabels', () => {
	test( 'labels WooCommerce extensions as e-commerce first', () => {
		expect(
			getProductBadgeLabels( product( 'woocommerce-woopayments', 'woocommerce-products' ) )
		).toEqual( [ 'E-commerce', 'Payments', 'Store management', 'Extension' ] );
	} );

	test( 'labels plans and add-ons by type', () => {
		expect( getProductBadgeLabels( product( 'jetpack-complete', 'jetpack-packs' ) ) ).toEqual( [
			'Bundle',
			'Plan',
		] );
		expect(
			getProductBadgeLabels(
				product( 'jetpack-backup-addon-storage-1tb-monthly', 'jetpack-backup-storage' )
			)
		).toEqual( [ 'Security', 'Add-on' ] );
		expect(
			getProductBadgeLabels( product( 'pressable-addon-sites-5', 'pressable-addon' ) )
		).toEqual( [ 'Hosting', 'Add-on' ] );
	} );
} );
