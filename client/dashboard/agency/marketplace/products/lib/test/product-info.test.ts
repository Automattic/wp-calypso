import { getProductBenefits, getProductRecommendedFor } from '../product-info';
import type { AgencyProduct } from '@automattic/api-core';

const product = ( slug: string, family_slug = 'jetpack-products' ): AgencyProduct => ( {
	name: slug,
	slug,
	product_id: 1,
	currency: 'USD',
	family_slug,
} );

describe( 'getProductBenefits', () => {
	test( 'finds benefits for Jetpack products', () => {
		expect( getProductBenefits( product( 'jetpack-backup-t1' ) ) ).not.toHaveLength( 0 );
	} );

	test( 'finds benefits for Jetpack plans', () => {
		expect( getProductBenefits( product( 'jetpack-complete', 'jetpack-packs' ) ) ).not.toHaveLength(
			0
		);
		expect(
			getProductBenefits( product( 'jetpack-security-t1', 'jetpack-packs' ) )
		).not.toHaveLength( 0 );
	} );

	test( 'returns nothing for products outside the catalog', () => {
		expect( getProductBenefits( product( 'pressable-addon-sites-5', 'pressable-addon' ) ) ).toEqual(
			[]
		);
	} );
} );

describe( 'getProductRecommendedFor', () => {
	test( 'returns labels for Jetpack products and plans', () => {
		expect( getProductRecommendedFor( product( 'jetpack-backup-t1' ) ) ).not.toHaveLength( 0 );
		expect(
			getProductRecommendedFor( product( 'jetpack-complete', 'jetpack-packs' ) )
		).not.toHaveLength( 0 );
		expect(
			getProductRecommendedFor( product( 'pressable-addon-sites-5', 'pressable-addon' ) )
		).toEqual( [] );
	} );
} );
