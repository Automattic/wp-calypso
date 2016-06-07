/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import PaginatedQueryManager from '../';

describe( 'PaginatedQueryManager', () => {
	let sandbox, manager;

	useSandbox( ( _sandbox ) => sandbox = _sandbox );
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
			manager = manager.receive( { ID: 144 }, { query: {} } );
			manager = manager.receive( { ID: 152 }, { query: { page: 2 } } );

			expect( manager.getItems( { number: 1, page: 1 } ) ).to.eql( [ { ID: 144 } ] );
			expect( manager.getItems( { number: 1, page: 2 } ) ).to.eql( [ { ID: 152 } ] );
			expect( manager.getItems( { number: 2, page: 1 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getItems( { number: 2, page: 2 } ) ).to.eql( [] );
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
			manager = manager.receive( { ID: 144 }, { query: {} } );
			manager = manager.receive( { ID: 152 }, { query: { page: 2 } } );

			expect( manager.getItemsIgnoringPage( {} ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
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
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 1 } } );

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
			sandbox.stub( manager, 'sort', ( query, a, b ) => a.ID - b.ID );
			manager = manager.receive( { ID: 154 } );

			expect( manager.getFound( { search: 'title' } ) ).to.equal( 7 );
			expect( manager.getNumberOfPages( { search: 'title', number: 2 } ) ).to.equal( 4 );
			expect( manager.getItems( { search: 'title', number: 2, page: 1 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 2 } ) ).to.eql( [ { ID: 154 }, { ID: 160 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 3 } ) ).to.eql( [ { ID: 168 }, { ID: 176 } ] );
			expect( manager.getItems( { search: 'title', number: 2, page: 4 } ) ).to.eql( [ { ID: 184 } ] );
		} );
	} );
} );
