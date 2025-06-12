// @ts-nocheck - TODO: Fix TypeScript issues
import selectAlphabeticallySortedProductOptions from '../select-alphabetically-sorted-product-options';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

const createFakeProduct = ( name: string ) => ( {
	name,
	slug: '',
	product_id: 0,
	currency: '',
	amount: 0,
	price_interval: '',
	family_slug: '',
} );

const createFakeFamily = ( products: APIProductFamilyProduct[] ) => ( {
	name: '',
	slug: '',
	products,
} );

describe( 'selectAlphabeticallySortedProductOptions', () => {
	it( 'returns all products from all families, sorted by their name', () => {
		const apple = createFakeProduct( 'apple' );
		const banana = createFakeProduct( 'banana' );
		const kiwi = createFakeProduct( 'kiwi' );
		const pear = createFakeProduct( 'pear' );

		const result = selectAlphabeticallySortedProductOptions( [
			createFakeFamily( [ banana, pear ] ),
			createFakeFamily( [ apple, kiwi ] ),
		] );

		expect( result[ 0 ] ).toBe( apple );
		expect( result[ 1 ] ).toBe( banana );
		expect( result[ 2 ] ).toBe( kiwi );
		expect( result[ 3 ] ).toBe( pear );
	} );
} );
