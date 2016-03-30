/**
 * External dependencies
 */
import { expect } from 'chai';

import Site from '..';

describe( 'Calypso Site', () => {
	describe( 'setting attributes', () => {
		let site;
		beforeEach( () => {
			site = Site( {
				ID: 1234,
				name: 'Hello',
				description: 'Hunting bugs is fun.'
			} );
		} );

		it( 'attribute changed', () => {
			site.set( { name: 'Goodbye' } );
			expect( site.name ).to.equal( 'Goodbye' );
		} );

		it( 'change event fires on attribute change', () => {
			let called = false;
			site.once( 'change', () => {
				called = true;
			} );
			site.set( { name: 'Goodbye' } );
			expect( called ).to.be.true;
		} );

		it( "change doesn't fire when setting attribute to same value", () => {
			let called = false;
			site.once( 'change', () => {
				called = true;
			} );
			site.set( { name: 'Hello' } );
			expect( called ).to.be.false;
		} );

		it( "change doesn't fire when attribute is set to an object with identical data", () => {
			let called = false;
			let nestedObj = {
				name: 'Hello, again.',
				description: 'Still hunting bugs.'
			}
			site.set( { nestedObj } );

			site.once( 'change', () => {
				called = true;
			} );

			site.set( {
				nestedObj: {
					name: 'Hello, again.',
					description: 'Still hunting bugs.'
				}
			} );
			expect( called ).to.be.false;
		} );

		it( "change doesn't fire when attribute is set to an array with identical data", () => {
			let called = false;
			site.set( { arr: [ 1, 2, 3 ] } );

			site.once( 'change', () => {
				 called = true;
			} );
			site.set( { arr: [ 1, 2, 3 ] } );
			expect( called ).to.be.false;
		} );
	} );
} );
