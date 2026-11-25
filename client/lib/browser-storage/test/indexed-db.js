/**
 * @vitest-environment jsdom
 */

import 'fake-indexeddb/auto'; // Polyfill indexedDB for this set of tests.

import {
	supportsIDB,
	clearStorage,
	setStoredItem,
	getStoredItem,
	getAllStoredItems,
} from 'calypso/lib/browser-storage';

describe( 'lib/browser-storage', () => {
	describe( 'when indexedDB is supported', () => {
		beforeEach( async () => {
			await clearStorage();
		} );

		it( 'should detect that indexedDB is supported', async () => {
			expect( await supportsIDB() ).toBeTruthy();
		} );

		it( 'should set and get a numeric item', async () => {
			await setStoredItem( 'number', 42 );
			expect( await getStoredItem( 'number' ) ).toBe( 42 );
		} );

		it( 'should set and get an object', async () => {
			await setStoredItem( 'object', { string: 'example', number: 42 } );
			expect( await getStoredItem( 'object' ) ).toEqual( { string: 'example', number: 42 } );
		} );

		it( 'should return undefined when fetching a missing item', async () => {
			expect( await getStoredItem( 'missing' ) ).toBe( undefined );
		} );

		it( 'should clear the store correctly', async () => {
			await setStoredItem( 'number', 42 );
			expect( await getStoredItem( 'number' ) ).toBe( 42 );
			await clearStorage();
			expect( await getStoredItem( 'number' ) ).toBe( undefined );
		} );

		it( 'should set and retrieve all items', async () => {
			await setStoredItem( 'item1', 1 );
			await setStoredItem( 'item2', 2 );
			await setStoredItem( 'item3', 3 );
			await setStoredItem( 'itemA', 'A' );

			expect( await getAllStoredItems() ).toEqual( {
				item1: 1,
				item2: 2,
				item3: 3,
				itemA: 'A',
			} );
		} );

		it( 'should set and retrieve all items that follow a pattern', async () => {
			await setStoredItem( 'item1', 1 );
			await setStoredItem( 'item2', 2 );
			await setStoredItem( 'item3', 3 );
			await setStoredItem( 'itemA', 'A' );

			expect( await getAllStoredItems( /item\d/ ) ).toEqual( {
				item1: 1,
				item2: 2,
				item3: 3,
			} );
		} );
	} );
} );
