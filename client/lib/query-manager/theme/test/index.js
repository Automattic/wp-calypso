/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ThemeQueryManager from '../';

/**
 * Constants
 */

describe( 'ThemeQueryManager', () => {
	let manager;

	beforeEach( () => {
		manager = new ThemeQueryManager();
	} );

	describe( '#removeItem()', () => {
		it( 'should remove an item by its item key', () => {
			manager = manager.receive( [ { ID: 144 } ] );
			const newManager = manager.removeItem( 144 );

			expect( manager ).to.not.equal( newManager );
			expect( manager.getItems() ).to.eql( [ { ID: 144 } ] );
			expect( newManager.getItems() ).to.eql( [] );
		} );

		it( 'should return the same instance if no items removed', () => {
			manager = manager.receive( [ { ID: 144 } ] );
			const newManager = manager.removeItem( 152 );

			expect( manager ).to.equal( newManager );
		} );

		it( 'should decrement the found count', () => {
			const query = { term: 'blah' };
			manager = manager.receive( [ { ID: 122 }, { ID: 133 }, { ID: 144 }, { ID: 155 } ], { query } );
			expect( manager.getFound( query ) ).to.equal( 4 );

			const newManager = manager.removeItem( 144 );
			expect( manager ).to.not.equal( newManager );
			expect( newManager.getFound( query ) ).to.equal( 3 );
		} );
	} );

	describe( '#removeItems()', () => {
		it( 'should remove an array of items by their item keys', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ] );
			const newManager = manager.removeItems( [ 144, 152 ] );

			expect( manager ).to.not.equal( newManager );
			expect( manager.getItems() ).to.eql( [ { ID: 144 }, { ID: 152 } ] );
			expect( newManager.getItems() ).to.eql( [] );
		} );

		it( 'should return the same instance if no items removed', () => {
			manager = manager.receive( [ { ID: 144 }, { ID: 152 } ] );
			const newManager = manager.removeItems( [ 160, 168 ] );

			expect( manager ).to.equal( newManager );
		} );
	} );
} );
