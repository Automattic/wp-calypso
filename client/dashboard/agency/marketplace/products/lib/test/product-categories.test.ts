import { getProductCategories, getProductFilterCategories } from '../product-categories';
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
