/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import {
	clearStorage,
	setStoredItem,
	getStoredItem,
	getAllStoredItems,
	bypassPersistentStorage,
} from 'calypso/lib/browser-storage';

describe( 'lib/browser-storage', () => {
	describe( 'bypass', () => {
		beforeEach( async () => {
			await clearStorage();
			bypassPersistentStorage( false );
			await clearStorage();
			bypassPersistentStorage( true );
		} );

		it( 'should not be able to retrieve persisted items when bypassing', async () => {
			bypassPersistentStorage( false );
			expect( async () => await setStoredItem( 'number', 42 ) ).not.toThrow();
			expect( await getStoredItem( 'number' ) ).toBe( 42 );
			bypassPersistentStorage( true );
			expect( await getStoredItem( 'number' ) ).toBe( undefined );
		} );

		it( 'should not persist items when disabling and re-enabling bypassing', async () => {
			expect( async () => await setStoredItem( 'number', 42 ) ).not.toThrow();
			expect( await getStoredItem( 'number' ) ).toBe( 42 );
			bypassPersistentStorage( false );
			bypassPersistentStorage( true );
			expect( await getStoredItem( 'number' ) ).toBe( undefined );
		} );

		it( 'should set and get a numeric item', async () => {
			expect( async () => await setStoredItem( 'number', 42 ) ).not.toThrow();
			expect( await getStoredItem( 'number' ) ).toBe( 42 );
		} );

		it( 'should set and get an object', async () => {
			expect(
				async () => await setStoredItem( 'object', { string: 'example', number: 42 } )
			).not.toThrow();
			expect( await getStoredItem( 'object' ) ).toEqual( { string: 'example', number: 42 } );
		} );

		it( 'should return undefined when fetching a missing item', async () => {
			expect( await getStoredItem( 'missing' ) ).toBe( undefined );
		} );

		it( 'should clear the store correctly', async () => {
			expect( async () => await setStoredItem( 'number', 42 ) ).not.toThrow();
			expect( await getStoredItem( 'number' ) ).toBe( 42 );
			expect( async () => await clearStorage() ).not.toThrow();
			expect( await getStoredItem( 'number' ) ).toBe( undefined );
		} );

		it( 'should set and retrieve all items', async () => {
			expect( async () => await setStoredItem( 'item1', 1 ) ).not.toThrow();
			expect( async () => await setStoredItem( 'item2', 2 ) ).not.toThrow();
			expect( async () => await setStoredItem( 'item3', 3 ) ).not.toThrow();
			expect( async () => await setStoredItem( 'itemA', 'A' ) ).not.toThrow();

			expect( await getAllStoredItems() ).toEqual( {
				item1: 1,
				item2: 2,
				item3: 3,
				itemA: 'A',
			} );
		} );

		it( 'should set and retrieve all items that follow a pattern', async () => {
			expect( async () => await setStoredItem( 'item1', 1 ) ).not.toThrow();
			expect( async () => await setStoredItem( 'item2', 2 ) ).not.toThrow();
			expect( async () => await setStoredItem( 'item3', 3 ) ).not.toThrow();
			expect( async () => await setStoredItem( 'itemA', 'A' ) ).not.toThrow();

			expect( await getAllStoredItems( /item\d/ ) ).toEqual( {
				item1: 1,
				item2: 2,
				item3: 3,
			} );
		} );
	} );
} );
