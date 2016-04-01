/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

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
			let changeCallback = sinon.spy();
			site.on( 'change', changeCallback );
			site.set( { name: 'Goodbye' } );
			expect( changeCallback.called ).to.be.true;
		} );

		it( "change doesn't fire when setting attribute to same value", () => {
			let changeCallback = sinon.spy();
			site.once( 'change', changeCallback );
			site.set( { name: 'Hello' } );
			expect( changeCallback.called ).to.be.false;
		} );

		it( "change doesn't fire when attribute is set to an object with identical data", () => {
			let changeCallback = sinon.spy();
			let nestedObj = {
				name: 'Hello, again.',
				description: 'Still hunting bugs.'
			}
			site.set( { nestedObj } );

			site.once( 'change', changeCallback );

			site.set( {
				nestedObj: {
					name: 'Hello, again.',
					description: 'Still hunting bugs.'
				}
			} );
			expect( changeCallback.called ).to.be.false;
		} );

		it( "change doesn't fire when attribute is set to an array with identical data", () => {
			let changeCallback = sinon.spy();
			site.set( { arr: [ 1, 2, 3 ] } );

			site.once( 'change', changeCallback );
			site.set( { arr: [ 1, 2, 3 ] } );
			expect( changeCallback.called ).to.be.false;
		} );
	} );
} );
