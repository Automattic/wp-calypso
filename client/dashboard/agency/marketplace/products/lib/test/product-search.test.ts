import { getProductSearchText } from '../product-search';
import type { AgencyProduct } from '@automattic/api-core';

const product = (
	slug: string,
	name: string,
	family_slug = 'jetpack-products'
): AgencyProduct => ( {
	name,
	slug,
	product_id: 1,
	currency: 'USD',
	family_slug,
} );

describe( 'getProductSearchText', () => {
	test( 'matches on the name and the listed features', () => {
		const text = getProductSearchText(
			product( 'jetpack-complete', 'Jetpack Complete', 'jetpack-packs' )
		);
		expect( text ).toContain( 'Jetpack Complete' );
		expect( text ).toContain( '1TB cloud storage' );
	} );

	test( 'matches a plan on the products it bundles', () => {
		const text = getProductSearchText(
			product( 'jetpack-complete', 'Jetpack Complete', 'jetpack-packs' )
		);
		expect( text ).toContain( 'Jetpack Akismet Anti-spam' );
		expect( text ).toContain( 'jetpack boost' );
	} );

	test( 'does not add bundled products to a standalone product', () => {
		const text = getProductSearchText( product( 'jetpack-boost', 'Jetpack Boost' ) );
		expect( text ).not.toContain( 'Anti-spam' );
	} );
} );
