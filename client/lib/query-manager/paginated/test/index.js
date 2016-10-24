/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import PaginatedQueryManager from '../';

/**
 * Module constants
 */
const TestCustomQueryManager = class TermQueryManager extends PaginatedQueryManager {};
TestCustomQueryManager.DEFAULT_QUERY = {
	number: 25
};

describe( 'PaginatedQueryManager', () => {
	let sandbox, manager;

	useSandbox( ( _sandbox ) => {
		sandbox = _sandbox;
		sandbox.stub( PaginatedQueryManager.prototype, 'sort', ( query, a, b ) => a.ID - b.ID );
	} );

	beforeEach( () => {
		manager = new PaginatedQueryManager();
	} );

	describe( '.hasQueryPaginationKeys()', () => {
		it( 'should return false if not passed a query', () => {
			const hasKeys = PaginatedQueryManager.hasQueryPaginationKeys();

			expect( hasKeys ).to.be.false;
		} );

		it( 'should return false if query has no pagination keys', () => {
			const hasKeys = PaginatedQueryManager.hasQueryPaginationKeys( { search: 'title' } );

			expect( hasKeys ).to.be.false;
		} );

		it( 'should return true if query has pagination keys', () => {
			const hasKeys = PaginatedQueryManager.hasQueryPaginationKeys( { search: 'title', number: 2 } );

			expect( hasKeys ).to.be.true;
		} );
	} );

	describe( '#getItems()', () => {
		it( 'should return all items when no query provided', () => {
			manager = manager.receive( { ID: 144 } );
			manager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager.getItems() ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
		} );

		it( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItems( {} ) ).to.be.null;
		} );

		it( 'should return a page subset of query items', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { number: 1, page: 2 } } );

			expect( manager.getItems( { number: 1, page: 1 } ) ).to.eql( [ { ID: 144 } ] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).to.eql( [ { ID: 152 } ] );
			expect( manager.getItems( { number: 2, page: 1 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getItems( { number: 2, page: 2 } ) ).to.eql( [] );
		} );

		it( 'should return page subset for non-sequentially received query', () => {
			manager = manager.receive( { ID: 152 }, { query: { page: 2, number: 1 } } );

			expect( manager.getItems( { number: 1, page: 1 } ) ).to.eql( [ undefined ] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).to.eql( [ { ID: 152 } ] );
		} );
	} );

	describe( '#getItemsIgnoringPage()', () => {
		it( 'should return null if not passed a query', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItemsIgnoringPage() ).to.be.null;
		} );

		it( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getItemsIgnoringPage( {} ) ).to.be.null;
		} );

		it( 'should return all pages of query items', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { number: 1, page: 2 } } );

			expect( manager.getItemsIgnoringPage( {} ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
		} );

		it( 'should exclude undefined items by default', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 }, found: 2 } );

			expect( manager.getItemsIgnoringPage( {} ) ).to.eql( [ { ID: 144 } ] );
		} );

		it( 'should include undefined items when opting to includeFiller argument', () => {
			manager = manager.receive( { ID: 144 }, { query: { number: 1 }, found: 2 } );

			expect( manager.getItemsIgnoringPage( {}, true ) ).to.eql( [ { ID: 144 }, undefined ] );
		} );
	} );

	describe( '#getNumberOfPages()', () => {
		it( 'should return null if the query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getNumberOfPages( {} ) ).to.be.null;
		} );

		it( 'should return null if the query is known, but found was not provided', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );

			expect( manager.getNumberOfPages( {} ) ).to.be.null;
		} );

		it( 'should return the number of pages assuming the default query number per page', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 30 } );

			expect( manager.getNumberOfPages( {} ) ).to.equal( 2 );
		} );

		it( 'should return the number of pages with an explicit number per page', () => {
			manager = manager.receive( { ID: 144 }, { query: {}, found: 30 } );

			expect( manager.getNumberOfPages( { number: 7 } ) ).to.equal( 5 );
		} );
	} );

	describe( '#receive()', () => {
		it( 'should return the same instance if no changes', () => {
			manager = manager.receive( { ID: 144 } );
			const newManager = manager.receive( { ID: 144 } );

			expect( manager ).to.equal( newManager );
		} );

		it( 'should update a single changed item', () => {
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive( { ID: 144, changed: true }, { query: { search: 'title', number: 1 } } );

			expect( manager.getItems( { search: 'title', number: 1 } ) ).to.eql( [ { ID: 144, changed: true } ] );
		} );

		it( 'should append paginated items, tracked as query sans pagination keys', () => {
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );

			expect( manager.getItems( { search: 'title', number: 1 } ) ).to.eql( [ { ID: 144 } ] );
			expect( manager.getItemsIgnoringPage( { search: 'title', number: 1 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
		} );

		it( 'should preserve existing pages when receiving items queried with different number', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: { number: 2 } } );
			manager = manager.receive( { ID: 144, changed: true }, { query: { number: 1 } } );

			expect( manager.getItemsIgnoringPage( {} ) ).to.eql( [ { ID: 144, changed: true }, { ID: 152 } ] );
			expect( manager.getItems( { number: 1, page: 1 } ) ).to.eql( [ { ID: 144, changed: true } ] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).to.eql( [ { ID: 152 } ] );
		} );

		it( 'should include filler undefined entries for yet-to-be-received items', () => {
			manager = manager.receive( [ { ID: 144 } ], { query: { number: 1, page: 2 }, found: 4 } );

			expect( manager.getItemsIgnoringPage( { number: 1 }, true ) ).to.eql( [ undefined, { ID: 144 }, undefined, undefined ] );
		} );

		it( 'should strip excess undefined entries beyond found count', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: { number: 20 }, found: 2 } );

			expect( manager.getItems( { number: 20 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
		} );

		it( 'should replace the existing page subset of a received query', () => {
			// Scenario: Received updated page 2 where ID:152 had been removed,
			// and in its place a new ID:154 (net found change: 0)
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 }, found: 3 } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );
			manager = manager.receive( { ID: 160 }, { query: { search: 'title', number: 1, page: 3 } } );
			manager = manager.receive( { ID: 154 }, { query: { search: 'title', number: 1, page: 2 } } );

			expect( manager.getItemsIgnoringPage( { search: 'title' } ) ).to.eql( [ { ID: 144 }, { ID: 154 }, { ID: 160 } ] );
			expect( manager.getFound( { search: 'title' } ) ).to.equal( 3 );
		} );

		it( 'should de-dupe if receiving a page includes existing item key', () => {
			// Scenario: Received first page with ID:144, second page with
			// ID:152, then deleted ID:144 and received updated first page
			// including only ID:152 (net found change: -1)
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 }, found: 2 } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 }, found: 2 } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 1 }, found: 1 } );

			expect( manager.getItems( { search: 'title', number: 1 } ) ).to.eql( [ { ID: 152 } ] );
			expect( manager.getItems( { search: 'title', number: 1, page: 2 } ) ).to.eql( [] );
			expect( manager.getFound( { search: 'title' } ) ).to.equal( 1 );
			expect( manager.getNumberOfPages( { search: 'title' } ) ).to.equal( 1 );
		} );

		it( 'should adjust for the difference in found after an item is removed', () => {
			// Scenario: Received 3 pages of data, then deleted an item in the
			// middle of the set (net found change: -1). Ensure also that pages
			// redistribute accordingly
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: { search: 'title', number: 2 }, found: 6 } );
			manager = manager.receive( [ { ID: 160 }, { ID: 168 } ], { query: { search: 'title', number: 2, page: 2 } } );
			manager = manager.receive( [ { ID: 176 }, { ID: 184 } ], { query: { search: 'title', number: 2, page: 3 } } );
			sandbox.stub( manager, 'matches' ).returns( false );
			manager = manager.receive( { ID: 160, changed: true } );

			expect( manager.getFound( { search: 'title' } ) ).to.equal( 5 );
			expect( manager.getItems( { search: 'title', number: 2, page: 2 } ) ).to.eql( [ { ID: 168 }, { ID: 176 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 3 } ) ).to.eql( [ { ID: 184 } ] );
		} );

		it( 'should adjust for the difference in found after an item is added', () => {
			// Scenario: Received 3 pages of data, then inserted an item in the
			// middle of the set (net found change: +1). Ensure also that pages
			// redistribute accordingly
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: { search: 'title', number: 2 }, found: 6 } );
			manager = manager.receive( [ { ID: 160 }, { ID: 168 } ], { query: { search: 'title', number: 2, page: 2 } } );
			manager = manager.receive( [ { ID: 176 }, { ID: 184 } ], { query: { search: 'title', number: 2, page: 3 } } );
			manager = manager.receive( { ID: 154 } );

			expect( manager.getFound( { search: 'title' } ) ).to.equal( 7 );
			expect( manager.getNumberOfPages( { search: 'title', number: 2 } ) ).to.equal( 4 );
			expect( manager.getItems( { search: 'title', number: 2, page: 1 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 2 } ) ).to.eql( [ { ID: 154 }, { ID: 160 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 3 } ) ).to.eql( [ { ID: 168 }, { ID: 176 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 4 } ) ).to.eql( [ { ID: 184 } ] );
		} );

		it( 'should use the constructors DEFAULT_QUERY.number if query object does not specify it', () => {
			let customizedManager = new TestCustomQueryManager();
			customizedManager = customizedManager.receive(
				[
					{ ID: 144 }, { ID: 152 }, { ID: 162 }, { ID: 164 }, { ID: 165 },
					{ ID: 244 }, { ID: 252 }, { ID: 262 }, { ID: 264 }, { ID: 265 },
					{ ID: 344 }, { ID: 352 }, { ID: 362 }, { ID: 364 }, { ID: 365 },
					{ ID: 444 }, { ID: 452 }, { ID: 462 }, { ID: 464 }, { ID: 465 },
					{ ID: 544 }, { ID: 552 }, { ID: 562 }, { ID: 564 }, { ID: 565 }
				], { query: { page: 1 }, found: 28 }
			);
			expect( customizedManager.getNumberOfPages( {} ) ).to.equal( 2 );
			expect( customizedManager.getItems( { page: 1 } ) ).eql( [
				{ ID: 144 }, { ID: 152 }, { ID: 162 }, { ID: 164 }, { ID: 165 },
				{ ID: 244 }, { ID: 252 }, { ID: 262 }, { ID: 264 }, { ID: 265 },
				{ ID: 344 }, { ID: 352 }, { ID: 362 }, { ID: 364 }, { ID: 365 },
				{ ID: 444 }, { ID: 452 }, { ID: 462 }, { ID: 464 }, { ID: 465 },
				{ ID: 544 }, { ID: 552 }, { ID: 562 }, { ID: 564 }, { ID: 565 }
			] );
		} );

		it( 'should correct the found count if received item count does not match query number', () => {
			// Scenario: Contributor receives first page of two items, with 4
			// found. Upon receiving second page, only one entry is provided,
			// presumably because they don't have access to the fourth. Thus,
			// found should be updated to reflect this discrepency.
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ], { query: { search: 'title', number: 2 }, found: 4 } );
			manager = manager.receive( [ { ID: 160 } ], { query: { search: 'title', number: 2, page: 2 } } );

			expect( manager.getFound( { search: 'title' } ) ).to.equal( 3 );
		} );
	} );
} );
