/**
 * @jest-environment jsdom
 */

import { JetpackPlans, type Purchase } from '@automattic/api-core';
import { getSitePurchaseStorageUpgradeUrl, getSitePurchaseUpgradeUrl } from '../site-url';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_slug: 'jetpack_backup_t1_yearly',
		site_slug: 'example.com',
		is_jetpack_backup_t1: true,
		is_jetpack_plan_or_product: true,
		...overrides,
	} as Purchase;
}

describe( 'getSitePurchaseStorageUpgradeUrl', () => {
	test( 'links a Backup T1 product to the storage upgrade page', () => {
		expect( getSitePurchaseStorageUpgradeUrl( makePurchase() ) ).toContain(
			'/plans/storage/example.com'
		);
	} );

	test( 'links a Security T1 plan to the storage upgrade page', () => {
		expect(
			getSitePurchaseStorageUpgradeUrl(
				makePurchase( {
					product_slug: JetpackPlans.PLAN_JETPACK_SECURITY_T1_YEARLY,
					is_jetpack_backup_t1: false,
				} )
			)
		).toContain( '/plans/storage/example.com' );
	} );

	test( 'returns undefined for a product that is not storage-eligible', () => {
		expect(
			getSitePurchaseStorageUpgradeUrl(
				makePurchase( { product_slug: 'business-bundle', is_jetpack_backup_t1: false } )
			)
		).toBeUndefined();
	} );
} );

describe( 'getSitePurchaseUpgradeUrl', () => {
	test( 'routes a storage-eligible product to the plan upgrade page, not the storage page', () => {
		const url = getSitePurchaseUpgradeUrl( makePurchase() );
		expect( url ).not.toContain( '/plans/storage' );
		expect( url ).toContain( '/plans/example.com' );
	} );
} );
