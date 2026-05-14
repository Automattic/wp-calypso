import {
	getPressableMemoryTarget,
	isPressablePhpMemoryAddon,
	keepFirstPressableMemoryAddonProduct,
} from '../pressable-memory-addon';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const buildProduct = (
	overrides: Partial< APIProductFamilyProduct > = {}
): APIProductFamilyProduct => ( {
	name: 'Pressable PHP Memory Add-on: 512MB',
	slug: 'pressable-addon-php-memory-512mb',
	product_id: 3263,
	currency: 'USD',
	amount: '0',
	price_interval: 'year',
	family_slug: 'pressable-addon',
	supported_bundles: [],
	...overrides,
} );

describe( 'pressable memory add-on helpers', () => {
	it( 'detects PHP memory add-on products', () => {
		expect( isPressablePhpMemoryAddon( buildProduct() ) ).toBe( true );
		expect(
			isPressablePhpMemoryAddon( buildProduct( { slug: 'pressable-addon-storage-1gb' } ) )
		).toBe( false );
	} );

	it( 'normalizes the target site/domain', () => {
		expect( getPressableMemoryTarget( buildProduct( { site_domain: ' example.com ' } ) ) ).toBe(
			'example.com'
		);
		expect( getPressableMemoryTarget( buildProduct() ) ).toBe( '' );
	} );

	it( 'keeps only the first PHP memory add-on product', () => {
		const storageAddon = buildProduct( { slug: 'pressable-addon-storage-1gb' } );
		const firstMemoryAddon = buildProduct( { site_domain: 'example.com' } );
		const secondMemoryAddon = buildProduct( { site_domain: 'another-example.com' } );

		expect(
			keepFirstPressableMemoryAddonProduct( [ storageAddon, firstMemoryAddon, secondMemoryAddon ] )
		).toEqual( [ storageAddon, firstMemoryAddon ] );
	} );
} );
