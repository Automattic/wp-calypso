/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

import Site from '..';

describe( 'Calypso Site', () => {
	describe( 'setting attributes', () => {
		const mockSiteData = {
			ID: 1234,
			name: 'Hello',
			description: 'Hunting bugs is fun.'
		}

		it( 'attribute changed', () => {
			const site = Site( mockSiteData );
			site.set( { name: 'Goodbye' } );
			expect( site.name ).to.equal( 'Goodbye' );
		} );

		it( 'change event fires on attribute change', () => {
			const changeCallback = sinon.spy();
			const site = Site( mockSiteData );
			site.on( 'change', changeCallback );
			site.set( { name: 'Goodbye' } );
			expect( changeCallback.called ).to.be.true;
		} );

		it( "change doesn't fire when setting attribute to same value", () => {
			const changeCallback = sinon.spy();
			const site = Site( mockSiteData );
			site.once( 'change', changeCallback );
			site.set( { name: 'Hello' } );
			expect( changeCallback.called ).to.be.false;
		} );

		it( "change doesn't fire when attribute is set to an object with identical data", () => {
			const changeCallback = sinon.spy();
			const nestedSiteData = Object.assign( {}, mockSiteData, {
				name: 'Hello, again',
				description: 'Still hunting bugs.'
			} );

			const site = Site( nestedSiteData );
			site.set( {
				name: 'Hello, again',
				description: 'Still hunting bugs.'
			} );

			site.once( 'change', changeCallback );
			expect( changeCallback.called ).to.be.false;
		} );

		it( "change doesn't fire when attribute is set to an array with identical data", () => {
			const changeCallback = sinon.spy();
			const site = Site( Object.assign( {}, mockSiteData, { arr: [ 1, 2, 3 ] } ) );

			site.once( 'change', changeCallback );
			site.set( { arr: [ 1, 2, 3 ] } );
			expect( changeCallback.called ).to.be.false;
		} );
	} );
} );
