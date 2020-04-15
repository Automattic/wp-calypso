/**
 * Internal dependencies
 */
import QueryManager, { DELETE_PATCH_KEY } from '../';

describe( 'QueryManager', () => {
	let manager;

	beforeEach( () => {
		manager = new QueryManager();
		jest.restoreAllMocks();
	} );

	describe( '#constructor()', () => {
		test( 'should accept initial data', () => {
			manager = new QueryManager( {
				items: {
					144: { ID: 144 },
					152: { ID: 152 },
				},
				queries: {
					'[]': {
						itemKeys: [ 152 ],
						found: 1,
					},
				},
			} );

			expect( manager.getItems() ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getItems( {} ) ).toEqual( [ { ID: 152 } ] );
		} );

		test( 'should allow customization of item key', () => {
			manager = new QueryManager( null, { itemKey: 'name' } );
			manager = manager.receive( { name: 'foo' } );

			expect( manager.data.items ).toHaveProperty( 'foo' );
		} );
	} );

	describe( '#mergeItem()', () => {
		test( 'should return the revised item by default', () => {
			const merged = QueryManager.mergeItem( { ID: 144 }, { ID: 152 } );

			expect( merged ).toEqual( { ID: 152 } );
		} );

		test( 'should return a merged item when patching', () => {
			const merged = QueryManager.mergeItem( { ID: 144 }, { changed: true }, true );

			expect( merged ).toEqual( { ID: 144, changed: true } );
		} );

		test( 'should not mutate the original copy', () => {
			const original = Object.freeze( { ID: 144 } );
			const merged = QueryManager.mergeItem( original, { changed: true }, true );

			expect( merged ).not.toBe( original );
		} );

		test( 'should return undefined if revised item includes delete key and patching', () => {
			const merged = QueryManager.mergeItem( { ID: 144 }, { [ DELETE_PATCH_KEY ]: true }, true );

			expect( merged ).toBeUndefined();
		} );
	} );

	describe( '#matches()', () => {
		test( 'should return false if item is not truthy', () => {
			expect( QueryManager.matches() ).toBe( false );
		} );

		test( 'should return true if item is truthy', () => {
			expect( QueryManager.matches( {}, {} ) ).toBe( true );
		} );
	} );

	describe( '#compare()', () => {
		test( 'should return 0 for equal items', () => {
			expect( QueryManager.compare( {}, 40, 40 ) ).toBe( 0 );
		} );

		test( 'should return a number less than zero if the first argument is larger', () => {
			expect( QueryManager.compare( {}, 50, 40 ) ).toBeLessThan( 0 );
		} );

		test( 'should return a number greater than zero if the first argument is smaller', () => {
			expect( QueryManager.compare( {}, 30, 40 ) ).toBeGreaterThan( 0 );
		} );
	} );

	describe( '#getItem()', () => {
		test( 'should return a single item', () => {
			const item = { ID: 144 };
			manager = manager.receive( item );

			expect( manager.getItem( 144 ) ).toBe( item );
		} );
	} );

	describe( '#getItems()', () => {
		test( 'should return all items when no query provided', () => {
			manager = manager.receive( { ID: 144 } );
			manager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should return items specific to query', () => {
			manager = manager.receive( { ID: 144 } );
			manager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 152 } ] );
		} );

		test( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItems( {} ) ).toBeNull();
		} );
	} );

	describe( '#getFound()', () => {
		test( 'should return null if the query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getFound( {} ) ).toBeNull();
		} );

		test( 'should return null if the query is known, but found was not provided', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );

			expect( manager.getFound( {} ) ).toBeNull();
		} );

		test( 'should return the found count associated with a query', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );

			expect( manager.getFound( {} ) ).toBe( 1 );
		} );
	} );

	describe( '#removeItem()', () => {
		test( 'should remove an item by its item key', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.removeItem( 144 );

			expect( manager ).not.toBe( newManager );
			expect( manager.getItems() ).toEqual( [ { ID: 144 } ] );
			expect( newManager.getItems() ).toEqual( [] );
		} );

		test( 'should return the same instance if no items removed', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.removeItem( 152 );

			expect( manager ).toBe( newManager );
		} );
	} );

	describe( '#removeItems()', () => {
		test( 'should remove an array of items by their item keys', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ] );
			const newManager = manager.removeItems( [ 144, 152 ] );

			expect( manager ).not.toBe( newManager );
			expect( manager.getItems() ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
			expect( newManager.getItems() ).toEqual( [] );
		} );

		test( 'should return the same instance if no items removed', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ] );
			const newManager = manager.removeItems( [ 160, 168 ] );

			expect( manager ).toBe( newManager );
		} );
	} );

	describe( '#receive()', () => {
		test( 'should receive an item', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 } ] );
		} );

		test( 'should receive an array of items', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ] );

			expect( manager.getItems() ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should return a new instance on changes', () => {
			const newManager = manager.receive( { ID: 144 } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should return a new instance when receiving a different query result', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.receive( { ID: 144 }, { query: { changed: true } } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should return a new instance when receiving only items', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.receive( { ID: 152 } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should return the same instance if no items received', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.receive( [] );

			expect( manager ).toBe( newManager );
		} );

		test( 'should return the same instance if no changes', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager ).toBe( newManager );
		} );

		test( 'should return the same instance only order changes, but not associated with query', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ] );
			const newManager = manager.receive( [ { ID: 152 }, { ID: 144 } ] );

			expect( manager ).toBe( newManager );
		} );

		test( 'should return a new instance when receiving an existing query changes its results', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			const newManager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should return a new instance when receiving an existing query changes its order', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: {} } );
			const newManager = manager.receive( [ { ID: 152 }, { ID: 144 } ], { query: {} } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should return the same instance when receiving an existing query with no changes', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			const newManager = manager.receive( { ID: 144 }, { query: {} } );

			expect( manager ).toBe( newManager );
		} );

		test( 'should return the same instance when receiving an existing query with no changes and merging', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, mergeQuery: true } );
			const newManager = manager.receive( { ID: 144 }, { query: {}, mergeQuery: true } );

			expect( manager ).toBe( newManager );
		} );

		test( 'should omit an item that returns undefined from #mergeItem()', () => {
			manager = manager.receive( { ID: 144 } );
			jest.spyOn( QueryManager, 'mergeItem' ).mockImplementation( () => undefined );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 } ] );
			expect( newManager.getItems() ).toEqual( [] );
		} );

		test( "should do nothing if #mergeItem() returns undefined but the item didn't exist", () => {
			manager = manager.receive();
			jest.spyOn( QueryManager, 'mergeItem' ).mockImplementation( () => undefined );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager ).toBe( newManager );
		} );

		test( 'should replace a received item when key already exists', () => {
			manager = manager.receive( { ID: 144, exists: true } );
			manager = manager.receive( { ID: 144, changed: true } );

			expect( manager.getItems() ).toEqual( [ { ID: 144, changed: true } ] );
		} );

		test( 'should patch a received patch item when key already exists', () => {
			manager = manager.receive( { ID: 144, exists: true } );
			manager = manager.receive( { ID: 144, changed: true }, { patch: true } );

			expect( manager.getItems() ).toEqual( [ { ID: 144, exists: true, changed: true } ] );
		} );

		test( 'should track a query set', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144 } ] );
		} );

		test( 'should replace the query set when a query updates', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			manager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 152 } ] );
		} );

		test( 'should merge received items into query set if mergeQuery option specified', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, mergeQuery: true } );
			manager = manager.receive( { ID: 152 }, { query: {}, mergeQuery: true } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should de-dupe received items into query set when merging', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, mergeQuery: true } );
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: {}, mergeQuery: true } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should remove a tracked query item when it no longer matches', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			jest.spyOn( QueryManager, 'matches' ).mockImplementation( () => false );
			const newManager = manager.receive( { ID: 144, changed: true } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 } ] );
			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144 } ] );
			expect( newManager.getItems() ).toEqual( [ { ID: 144, changed: true } ] );
			expect( newManager.getItems( {} ) ).toEqual( [] );
		} );

		test( 'should be order sensitive to tracked query items', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: {} } );
			manager = manager.receive( [ { ID: 152 }, { ID: 144 } ], { query: {} } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 152 }, { ID: 144 } ] );
		} );

		test( 'should remove a tracked query item when it is omitted from items', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			jest.spyOn( QueryManager, 'mergeItem' ).mockImplementation( () => undefined );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 } ] );
			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144 } ] );
			expect( newManager.getItems() ).toEqual( [] );
			expect( newManager.getItems( {} ) ).toEqual( [] );
		} );

		test( 'should track an item that previous did not match', () => {
			manager = manager.receive( [], { query: {} } );
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 } ] );
			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144 } ] );
		} );

		test( 'should compare items appended to query set', () => {
			manager = manager.receive( [ { ID: 140 }, { ID: 160 } ], { query: {} } );
			jest.spyOn( QueryManager, 'compare' ).mockImplementation( ( query, a, b ) => a.ID - b.ID );
			manager = manager.receive( { ID: 150 } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 140 }, { ID: 150 }, { ID: 160 } ] );
		} );

		test( 'should accept an optional total found count', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );

			expect( manager.getFound( {} ) ).toBe( 1 );
		} );

		test( 'should return a new instance when associating found with a query', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			const newManager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should return the same instance when found has not changed', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );
			const newManager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );

			expect( manager ).toBe( newManager );
		} );

		test( 'should return a new instance when changing found for a query', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );
			const newManager = manager.receive( { ID: 144 }, { query: {}, found: 2 } );

			expect( manager ).not.toBe( newManager );
		} );

		test( 'should not replace the previous found count if omitted in next received query', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );
			manager = manager.receive( { ID: 144, changed: true }, { query: {} } );

			expect( manager.getItems( {} ) ).toEqual( [ { ID: 144, changed: true } ] );
			expect( manager.getFound( {} ) ).toBe( 1 );
		} );

		test( 'should increment found count if adding a matched item', () => {
			manager = manager.receive( [], { query: {}, found: 0 } );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager.getFound( {} ) ).toBe( 0 );
			expect( newManager.getFound( {} ) ).toBe( 1 );
		} );

		test( 'should decrement found count if removing an unmatched item', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 1 } );
			jest.spyOn( QueryManager, 'matches' ).mockImplementation( () => false );
			const newManager = manager.receive( { ID: 144, changed: true } );

			expect( manager.getFound( {} ) ).toBe( 1 );
			expect( newManager.getFound( {} ) ).toBe( 0 );
		} );

		test( 'should not change found count if merging items into existing query', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 2 } );
			const newManager = manager.receive( { ID: 152 }, { query: {}, mergeQuery: true } );

			expect( manager.getFound( {} ) ).toBe( 2 );
			expect( newManager.getFound( {} ) ).toBe( 2 );
			expect( newManager.getItems( {} ) ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should sort items when merging queries', () => {
			jest.spyOn( QueryManager, 'compare' ).mockImplementation( ( query, a, b ) => a.ID - b.ID );
			[ { ID: 4 }, { ID: 2 }, { ID: 3 } ].forEach(
				( item ) =>
					( manager = manager.receive( item, {
						mergeQuery: true,
						query: {},
					} ) )
			);
			expect( manager.getItems( {} ) ).toEqual( [ { ID: 2 }, { ID: 3 }, { ID: 4 } ] );
		} );

		test( 'should sort when extended using subclassed static compare', () => {
			let sortingManager = new ( class extends QueryManager {
				static compare( query, a, b ) {
					return a.ID - b.ID;
				}
			} )();
			[ { ID: 4 }, { ID: 2 }, { ID: 3 } ].forEach(
				( item ) =>
					( sortingManager = sortingManager.receive( item, {
						mergeQuery: true,
						query: {},
					} ) )
			);
			expect( sortingManager.getItems( {} ) ).toEqual( [ { ID: 2 }, { ID: 3 }, { ID: 4 } ] );
		} );
	} );

	describe( '.QueryKey', () => {
		test( 'should include a .stringify() method', () => {
			expect( typeof QueryManager.QueryKey.stringify ).toBe( 'function' );
		} );

		test( 'should include a .parse() method', () => {
			expect( typeof QueryManager.QueryKey.parse ).toBe( 'function' );
		} );
	} );
} );
