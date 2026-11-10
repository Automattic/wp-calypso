import { getProductCategories } from '../product-categories';
import type { AgencyProduct } from '@automattic/api-core';

const product = ( slug: string, family_slug: string ): AgencyProduct => ( {
	name: slug,
	slug,
	product_id: 1,
	currency: 'USD',
	family_slug,
} );

describe( 'getProductCategories', () => {
	test( 'leaves plans without a job category', () => {
		expect( getProductCategories( product( 'jetpack-complete', 'jetpack-packs' ) ) ).toEqual( [] );
		expect( getProductCategories( product( 'jetpack-security-t1', 'jetpack-packs' ) ) ).toEqual(
			[]
		);
	} );

	test( 'counts the backup storage add-ons as security', () => {
		expect(
			getProductCategories(
				product( 'jetpack-backup-addon-storage-10gb-monthly', 'jetpack-backup-storage' )
			)
		).toEqual( [ 'security' ] );
	} );
} );
