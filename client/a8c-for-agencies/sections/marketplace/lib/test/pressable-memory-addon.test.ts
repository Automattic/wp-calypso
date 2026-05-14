import {
	getProductCardKey,
	getPressableMemoryTarget,
	isPressablePhpMemoryAddon,
	isSameMarketplaceProduct,
} from '../pressable-memory-addon';
import type { ShoppingCartItem } from '../../types';
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

const buildCartItem = ( overrides: Partial< ShoppingCartItem > = {} ): ShoppingCartItem => ( {
	...buildProduct(),
	quantity: 1,
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

	it( 'uses the target site/domain in card identity', () => {
		expect( getProductCardKey( buildProduct( { site_domain: 'example.com' } ) ) ).toBe(
			'pressable-addon-php-memory-512mb:example.com'
		);
		expect( getProductCardKey( buildProduct( { site_domain: 'client site.test' } ) ) ).toBe(
			'pressable-addon-php-memory-512mb:client%20site.test'
		);
	} );

	it( 'matches PHP memory cart items by slug, quantity, and target site/domain', () => {
		const product = buildProduct( { site_domain: 'example.com' } );

		expect(
			isSameMarketplaceProduct( buildCartItem( { site_domain: 'example.com' } ), product, 1 )
		).toBe( true );
		expect(
			isSameMarketplaceProduct(
				buildCartItem( { site_domain: 'another-example.com' } ),
				product,
				1
			)
		).toBe( false );
	} );

	it( 'keeps non-memory products matched by slug and quantity only', () => {
		const product = buildProduct( {
			slug: 'pressable-addon-storage-1gb',
			site_domain: 'example.com',
		} );

		expect(
			isSameMarketplaceProduct(
				buildCartItem( { slug: 'pressable-addon-storage-1gb', site_domain: 'other.com' } ),
				product,
				1
			)
		).toBe( true );
	} );
} );
