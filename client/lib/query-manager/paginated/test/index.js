/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../';

/**
 * Provide subclass with compare method implementation for testing
 */
class TestCustomQueryManager extends PaginatedQueryManager {
	static compare( query, a, b ) {
		return a.ID - b.ID;
	}
}

describe( 'PaginatedQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new TestCustomQueryManager();
		jest.restoreAllMocks();
	} );

	describe( '.hasQueryPaginationKeys()', () => {
		test( 'should return false if not passed a query', () => {
			const hasKeys = PaginatedQueryManager.hasQueryPaginationKeys();

			expect( hasKeys ).toBe( false );
		} );

		test( 'should return false if query has no pagination keys', () => {
			const hasKeys = PaginatedQueryManager.hasQueryPaginationKeys( {
				search: 'title',
			} );

			expect( hasKeys ).toBe( false );
		} );

		test( 'should return true if query has pagination keys', () => {
			const hasKeys = PaginatedQueryManager.hasQueryPaginationKeys( {
				search: 'title',
				number: 2,
			} );

			expect( hasKeys ).toBe( true );
		} );
	} );

	describe( '#getItems()', () => {
		test( 'should return all items when no query provided', () => {
			manager = manager.receive( { ID: 144 } );
			manager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager.getItems() ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItems( {} ) ).toBeNull();
		} );

		test( 'should return a page subset of query items', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { number: 1, page: 2 } } );

			expect( manager.getItems( { number: 1, page: 1 } ) ).toEqual( [ { ID: 144 } ] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).toEqual( [ { ID: 152 } ] );
			expect( manager.getItems( { number: 2, page: 1 } ) ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getItems( { number: 2, page: 2 } ) ).toEqual( [] );
		} );

		test( 'should memoize paginated results', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { number: 1, page: 2 } } );

			const firstPage1 = manager.getItems( { number: 1, page: 1 } );
			const secondPage1 = manager.getItems( { number: 1, page: 2 } );
			const firstPage2 = manager.getItems( { number: 1, page: 1 } );
			const secondPage2 = manager.getItems( { number: 1, page: 2 } );

			expect( firstPage1.map( ( item ) => item.ID ) ).toEqual( [ 144 ] );
			expect( secondPage1.map( ( item ) => item.ID ) ).toEqual( [ 152 ] );
			expect( firstPage1 ).toBe( firstPage2 );
			expect( secondPage1 ).toBe( secondPage2 );
		} );

		test( 'should invalidate memoized results when the underlying data change', () => {
			// receive first page
			manager = manager.receive( { ID: 144 }, { query: { number: 1 } } );
			const firstPage1 = manager.getItems( { number: 1, page: 1 } );

			// receive second page, invalidating the memoized `items`
			manager = manager.receive( { ID: 152 }, { query: { number: 1, page: 2 } } );
			const firstPage2 = manager.getItems( { number: 1, page: 1 } );

			expect( firstPage1.map( ( item ) => item.ID ) ).toEqual( [ 144 ] );
			expect( firstPage1 ).toEqual( firstPage2 ); // results are the same
			expect( firstPage1 ).not.toBe( firstPage2 ); // but the instances are different
		} );

		test( 'should return page subset for non-sequentially received query', () => {
			manager = manager.receive( { ID: 152 }, { query: { page: 2, number: 1 } } );

			expect( manager.getItems( { number: 1, page: 1 } ) ).toEqual( [ undefined ] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).toEqual( [ { ID: 152 } ] );
		} );
	} );

	describe( '#getItemsIgnoringPage()', () => {
		test( 'should return null if not passed a query', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItemsIgnoringPage() ).toBeNull();
		} );

		test( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItemsIgnoringPage( {} ) ).toBeNull();
		} );

		test( 'should return all pages of query items', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { number: 1, page: 2 } } );

			expect( manager.getItemsIgnoringPage( {} ) ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should exclude undefined items by default', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 }, found: 2 } );

			expect( manager.getItemsIgnoringPage( {} ) ).toEqual( [ { ID: 144 } ] );
		} );

		test( 'should include undefined items when opting to includeFiller argument', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 }, found: 2 } );

			expect( manager.getItemsIgnoringPage( {}, true ) ).toEqual( [ { ID: 144 }, undefined ] );
		} );
	} );

	describe( '#getNumberOfPages()', () => {
		test( 'should return null if the query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getNumberOfPages( {} ) ).toBeNull();
		} );

		test( 'should return null if the query is known, but found was not provided', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );

			expect( manager.getNumberOfPages( {} ) ).toBeNull();
		} );

		test( 'should return the number of pages assuming the default query number per page', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 30 } );

			expect( manager.getNumberOfPages( {} ) ).toBe( 2 );
		} );

		test( 'should return the number of pages with an explicit number per page', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 30 } );

			expect( manager.getNumberOfPages( { number: 7 } ) ).toBe( 5 );
		} );
	} );

	describe( '#receive()', () => {
		test( 'should return the same instance if no changes', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager ).toBe( newManager );
		} );

		test( 'should update a single changed item', () => {
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive(
				{ ID: 144, changed: true },
				{ query: { search: 'title', number: 1 } }
			);

			expect( manager.getItems( { search: 'title', number: 1 } ) ).toEqual( [
				{ ID: 144, changed: true },
			] );
		} );

		test( 'should append paginated items, tracked as query sans pagination keys', () => {
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );

			expect( manager.getItems( { search: 'title', number: 1 } ) ).toEqual( [ { ID: 144 } ] );
			expect( manager.getItemsIgnoringPage( { search: 'title', number: 1 } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
			] );
		} );

		test( 'should preserve existing pages when receiving items queried with different number', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], {
				query: { number: 2 },
			} );
			manager = manager.receive( { ID: 144, changed: true }, { query: { number: 1 } } );

			expect( manager.getItemsIgnoringPage( {} ) ).toEqual( [
				{ ID: 144, changed: true },
				{ ID: 152 },
			] );
			expect( manager.getItems( { number: 1, page: 1 } ) ).toEqual( [
				{ ID: 144, changed: true },
			] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).toEqual( [ { ID: 152 } ] );
		} );

		test( 'should include filler undefined entries for yet-to-be-received items', () => {
			manager = manager.receive( [ { ID: 144 } ], {
				query: { number: 1, page: 2 },
				found: 4,
			} );

			expect( manager.getItemsIgnoringPage( { number: 1 }, true ) ).toEqual( [
				undefined,
				{ ID: 144 },
				undefined,
				undefined,
			] );
		} );

		test( 'should strip excess undefined entries beyond found count', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], {
				query: { number: 20 },
				found: 2,
			} );

			expect( manager.getItems( { number: 20 } ) ).toEqual( [ { ID: 144 }, { ID: 152 } ] );
		} );

		test( 'should replace the existing page subset of a received query', () => {
			// Scenario: Received updated page 2 where ID:152 had been removed,
			// and in its place a new ID:154 (net found change: 0)
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 }, found: 3 } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );
			manager = manager.receive( { ID: 160 }, { query: { search: 'title', number: 1, page: 3 } } );
			manager = manager.receive( { ID: 154 }, { query: { search: 'title', number: 1, page: 2 } } );

			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 154 },
				{ ID: 160 },
			] );
			expect( manager.getFound( { search: 'title' } ) ).toBe( 3 );
		} );

		test( 'should de-dupe if receiving a page includes existing item key', () => {
			// Scenario: Received first page with ID:144, second page with
			// ID:152, then deleted ID:144 and received updated first page
			// including only ID:152 (net found change: -1)
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 }, found: 2 } );
			manager = manager.receive(
				{ ID: 152 },
				{ query: { search: 'title', number: 1, page: 2 }, found: 2 }
			);
			manager = manager.receive(
				{ ID: 152 },
				{ query: { search: 'title', number: 1, page: 1 }, found: 1 }
			);

			expect( manager.getItems( { search: 'title', number: 1 } ) ).toEqual( [ { ID: 152 } ] );
			expect( manager.getItems( { search: 'title', number: 1, page: 2 } ) ).toEqual( [] );
			expect( manager.getFound( { search: 'title' } ) ).toBe( 1 );
			expect( manager.getNumberOfPages( { search: 'title' } ) ).toBe( 1 );
		} );

		test( 'should adjust for the difference in found after an item is removed', () => {
			// Scenario: Received 3 pages of data, then deleted an item in the
			// middle of the set (net found change: -1). Ensure also that pages
			// redistribute accordingly
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], {
				query: { search: 'title', number: 2 },
				found: 6,
			} );
			manager = manager.receive( [ { ID: 160 }, { ID: 168 } ], {
				query: { search: 'title', number: 2, page: 2 },
			} );
			manager = manager.receive( [ { ID: 176 }, { ID: 184 } ], {
				query: { search: 'title', number: 2, page: 3 },
			} );
			jest.spyOn( PaginatedQueryManager, 'matches' ).mockImplementation( () => false );
			manager = manager.receive( { ID: 160, changed: true } );

			expect( manager.getFound( { search: 'title' } ) ).toBe( 5 );
			expect( manager.getItems( { search: 'title', number: 2, page: 2 } ) ).toEqual( [
				{ ID: 168 },
				{ ID: 176 },
			] );
			expect( manager.getItems( { search: 'title', number: 2, page: 3 } ) ).toEqual( [
				{ ID: 184 },
			] );
		} );

		test( 'should adjust for the difference in found after an item is added', () => {
			// Scenario: Received 3 pages of data, then inserted an item in the
			// middle of the set (net found change: +1). Ensure also that pages
			// redistribute accordingly
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], {
				query: { search: 'title', number: 2 },
				found: 6,
			} );
			manager = manager.receive( [ { ID: 160 }, { ID: 168 } ], {
				query: { search: 'title', number: 2, page: 2 },
			} );
			manager = manager.receive( [ { ID: 176 }, { ID: 184 } ], {
				query: { search: 'title', number: 2, page: 3 },
			} );
			manager = manager.receive( { ID: 154 } );

			expect( manager.getFound( { search: 'title' } ) ).toBe( 7 );
			expect( manager.getNumberOfPages( { search: 'title', number: 2 } ) ).toBe( 4 );
			expect( manager.getItems( { search: 'title', number: 2, page: 1 } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
			] );
			expect( manager.getItems( { search: 'title', number: 2, page: 2 } ) ).toEqual( [
				{ ID: 154 },
				{ ID: 160 },
			] );
			expect( manager.getItems( { search: 'title', number: 2, page: 3 } ) ).toEqual( [
				{ ID: 168 },
				{ ID: 176 },
			] );
			expect( manager.getItems( { search: 'title', number: 2, page: 4 } ) ).toEqual( [
				{ ID: 184 },
			] );
		} );

		test( 'should use the constructors DefaultQuery.number if query object does not specify it', () => {
			const customizedManager = new ( class extends TestCustomQueryManager {
				static DefaultQuery = { number: 25 };
			} )().receive(
				[
					{ ID: 144 },
					{ ID: 152 },
					{ ID: 162 },
					{ ID: 164 },
					{ ID: 165 },
					{ ID: 244 },
					{ ID: 252 },
					{ ID: 262 },
					{ ID: 264 },
					{ ID: 265 },
					{ ID: 344 },
					{ ID: 352 },
					{ ID: 362 },
					{ ID: 364 },
					{ ID: 365 },
					{ ID: 444 },
					{ ID: 452 },
					{ ID: 462 },
					{ ID: 464 },
					{ ID: 465 },
					{ ID: 544 },
					{ ID: 552 },
					{ ID: 562 },
					{ ID: 564 },
					{ ID: 565 },
				],
				{ query: { page: 1 }, found: 28 }
			);
			expect( customizedManager.getNumberOfPages( {} ) ).toBe( 2 );
			expect( customizedManager.getItems( { page: 1 } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
				{ ID: 162 },
				{ ID: 164 },
				{ ID: 165 },
				{ ID: 244 },
				{ ID: 252 },
				{ ID: 262 },
				{ ID: 264 },
				{ ID: 265 },
				{ ID: 344 },
				{ ID: 352 },
				{ ID: 362 },
				{ ID: 364 },
				{ ID: 365 },
				{ ID: 444 },
				{ ID: 452 },
				{ ID: 462 },
				{ ID: 464 },
				{ ID: 465 },
				{ ID: 544 },
				{ ID: 552 },
				{ ID: 562 },
				{ ID: 564 },
				{ ID: 565 },
			] );
		} );

		// Some items may be missing from API results pages.  See comments in
		// PaginatedQueryManager#receive() for details.

		test( 'handles items missing from the last page', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], {
				query: { search: 'title', number: 2 },
				found: 4,
			} );

			expect( manager.getFound( { search: 'title' } ) ).toBe( 4 );
			expect( manager.getItems( { search: 'title', number: 2, page: 1 } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
			] );

			manager = manager.receive( [ { ID: 160 } ], {
				query: { search: 'title', number: 2, page: 2 },
			} );

			expect( manager.getFound( { search: 'title' } ) ).toBe( 4 );
			expect( manager.getItems( { search: 'title', number: 2, page: 1 } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
			] );
			expect( manager.getItems( { search: 'title', number: 2, page: 2 } ) ).toEqual( [
				{ ID: 160 },
				undefined,
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 144 },
				{ ID: 152 },
				{ ID: 160 },
			] );
		} );

		test( 'handles items missing from the first page', () => {
			manager = manager.receive( [ { ID: 1 }, { ID: 3 } ], {
				query: { search: 'title', number: 3 },
				found: 5, // The API found 6 results and decremented 1.
			} );

			// We would like for "found" to be 6, but at this point we don't
			// have this information yet.
			expect( manager.getFound( { search: 'title' } ) ).toBe( 5 );
			expect( manager.getItems( { search: 'title', number: 3, page: 1 } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				undefined,
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
			] );

			manager = manager.receive( [ { ID: 4 }, { ID: 5 }, { ID: 6 } ], {
				query: { search: 'title', number: 3, page: 2 },
				found: 6,
			} );

			expect( manager.getFound( { search: 'title' } ) ).toBe( 6 );
			expect( manager.getItems( { search: 'title', number: 3, page: 1 } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				undefined,
			] );
			expect( manager.getItems( { search: 'title', number: 3, page: 2 } ) ).toEqual( [
				{ ID: 4 },
				{ ID: 5 },
				{ ID: 6 },
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				{ ID: 4 },
				{ ID: 5 },
				{ ID: 6 },
			] );
		} );

		test( 'handles items missing from the first and last pages', () => {
			manager = manager.receive( [ { ID: 1 }, { ID: 3 } ], {
				query: { search: 'title', number: 3 },
				found: 8, // The API found 9 results and decremented 1.
			} );

			// We would like for "found" to be 9, but at this point we don't
			// have this information yet.
			expect( manager.getFound( { search: 'title' } ) ).toBe( 8 );
			expect( manager.getItems( { search: 'title', number: 3, page: 1 } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				undefined,
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
			] );

			manager = manager.receive( [ { ID: 4 }, { ID: 5 }, { ID: 6 } ], {
				query: { search: 'title', number: 3, page: 2 },
				found: 9,
			} );

			expect( manager.getFound( { search: 'title' } ) ).toBe( 9 );
			expect( manager.getItems( { search: 'title', number: 3, page: 1 } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				undefined,
			] );
			expect( manager.getItems( { search: 'title', number: 3, page: 2 } ) ).toEqual( [
				{ ID: 4 },
				{ ID: 5 },
				{ ID: 6 },
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				{ ID: 4 },
				{ ID: 5 },
				{ ID: 6 },
			] );

			manager = manager.receive( [ { ID: 7 }, { ID: 9 } ], {
				query: { search: 'title', number: 3, page: 3 },
				found: 8, // The API found 9 results and decremented 1.
			} );

			// We should remember the previous, higher "found" count of 9.  For
			// the purpose of determining the total number of pages, it is more
			// accurate.
			expect( manager.getFound( { search: 'title' } ) ).toBe( 9 );
			// TODO - Pagination split has changed by this point (the
			// `undefined` item has moved to the end of page 2).  Not sure why,
			// and it is unlikely to cause problems in practice since we call
			// `getItemsIgnoringPage`.
			expect( manager.getItems( { search: 'title', number: 3, page: 1 } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				{ ID: 4 },
			] );
			expect( manager.getItems( { search: 'title', number: 3, page: 2 } ) ).toEqual( [
				{ ID: 5 },
				{ ID: 6 },
				undefined,
			] );
			expect( manager.getItems( { search: 'title', number: 3, page: 3 } ) ).toEqual( [
				{ ID: 7 },
				{ ID: 9 },
				undefined,
			] );
			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).toEqual( [
				{ ID: 1 },
				{ ID: 3 },
				{ ID: 4 },
				{ ID: 5 },
				{ ID: 6 },
				{ ID: 7 },
				{ ID: 9 },
			] );
		} );
	} );
} );
