/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../';

describe( 'PaginatedQueryManager', () => {
	let manager;
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

	describe( '#getData()', () => {
		it( 'should return all items when no query provided', () => {
			manager = manager.receive( { ID: 144 } );
			manager = manager.receive( { ID: 152 }, { query: {} } );

			expect( manager.getData() ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
		} );

		it( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getData( {} ) ).to.be.null;
		} );

		it( 'should return a page subset of query items', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			manager = manager.receive( { ID: 152 }, { query: { page: 2 } } );

			expect( manager.getData( { number: 1, page: 1 } ) ).to.eql( [ { ID: 144 } ] );
			expect( manager.getData( { number: 1, page: 2 } ) ).to.eql( [ { ID: 152 } ] );
			expect( manager.getData( { number: 2, page: 1 } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
			expect( manager.getData( { number: 2, page: 2 } ) ).to.eql( [] );
		} );
	} );

	describe( '#getDataIgnoringPage()', () => {
		it( 'should return null if not passed a query', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getDataIgnoringPage() ).to.be.null;
		} );

		it( 'should return null if query is unknown', () => {
			manager = manager.receive( { ID: 144 } );

			expect( manager.getDataIgnoringPage( {} ) ).to.be.null;
		} );

		it( 'should return all pages of query items', () => {
			manager = manager.receive( { ID: 144 }, { query: {} } );
			manager = manager.receive( { ID: 152 }, { query: { page: 2 } } );

			expect( manager.getDataIgnoringPage( {} ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
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

			expect( manager.getData( { search: 'title' } ) ).to.eql( [ { ID: 144, changed: true } ] );
		} );

		it( 'should append paginated items, tracked as query sans pagination keys', () => {
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );

			expect( manager.getData( { search: 'title' } ) ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
		} );

		it( 'should replace the existing page subset of a received query', () => {
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );
			manager = manager.receive( { ID: 160 }, { query: { search: 'title', number: 1, page: 3 } } );
			manager = manager.receive( { ID: 154 }, { query: { search: 'title', number: 1, page: 2 } } );

			expect( manager.getData( { search: 'title' } ) ).to.eql( [ { ID: 144 }, { ID: 154 }, { ID: 160 } ] );
		} );

		it( 'should de-dupe if receiving a page includes existing item key', () => {
			// Example: Received first page with ID:144, second page with
			// ID:152, then deleted ID:144 and received updated first page
			// including only ID:152
			manager = manager.receive( { ID: 144 }, { query: { search: 'title', number: 1 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 2 } } );
			manager = manager.receive( { ID: 152 }, { query: { search: 'title', number: 1, page: 1 } } );

			expect( manager.getData( { search: 'title' } ) ).to.eql( [ { ID: 152 } ] );
			expect( manager.getData( { search: 'title', page: 2 } ) ).to.eql( [] );
		} );
	} );
} );
