/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { parseCartEntries, useShoppingCart } from '../use-shopping-cart';

jest.mock( '../../use-marketplace-type', () => ( {
	useMarketplaceType: () => ( { marketplaceType: 'regular' } ),
} ) );

const STORAGE_KEY = 'shopping-card-selected-items';
const MEMORY_ADDON = 'pressable-addon-php-memory-512';

describe( 'useShoppingCart', () => {
	afterEach( () => {
		const { result } = renderHook( () => useShoppingCart() );
		act( () => result.current.clearCart() );
	} );

	it( 'keeps one PHP memory add-on per site, and removes only the one asked for', () => {
		const { result } = renderHook( () => useShoppingCart() );

		act( () => {
			result.current.addItem( { slug: MEMORY_ADDON, siteDomain: 'one.example.com' } );
			result.current.addItem( { slug: MEMORY_ADDON, siteDomain: 'two.example.com' } );
		} );
		expect( result.current.items ).toHaveLength( 2 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBe(
			`${ MEMORY_ADDON }:1:::one.example.com,${ MEMORY_ADDON }:1:::two.example.com`
		);

		act( () => result.current.removeItem( { slug: MEMORY_ADDON, siteDomain: 'one.example.com' } ) );
		expect( result.current.hasItem( { slug: MEMORY_ADDON, siteDomain: 'one.example.com' } ) ).toBe(
			false
		);
		expect( result.current.hasItem( { slug: MEMORY_ADDON, siteDomain: 'two.example.com' } ) ).toBe(
			true
		);
	} );

	it( 'reads the site from a cart entry the classic marketplace stored', () => {
		expect(
			parseCartEntries( `${ MEMORY_ADDON }:1::site%2Ccom:three%2Eexample.com,jetpack-scan:1` )
		).toEqual( [
			{
				slug: MEMORY_ADDON,
				quantity: 1,
				siteDomain: 'three.example.com',
				raw: `${ MEMORY_ADDON }:1::site%2Ccom:three%2Eexample.com`,
			},
			{ slug: 'jetpack-scan', quantity: 1, raw: 'jetpack-scan:1' },
		] );
	} );

	it( 'leaves out a site that cannot be decoded', () => {
		expect( parseCartEntries( `${ MEMORY_ADDON }:1:::%zz` ) ).toEqual( [
			{ slug: MEMORY_ADDON, quantity: 1, raw: `${ MEMORY_ADDON }:1:::%zz` },
		] );
	} );
} );
