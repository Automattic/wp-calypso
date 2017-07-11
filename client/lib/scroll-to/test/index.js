/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

describe( 'scroll-to', () => {
	let scrollTo;

	before( () => {
		scrollTo = require( '..' );
		sinon.spy( window, 'scrollTo' );
	} );

	afterEach( () => {
		window.scrollTo.reset();
	} );

	it( 'window position x', done => {
		scrollTo( {
			x: 500,
			y: 300,
			duration: 1,
			onComplete: () => {
				expect( window.scrollTo.lastCall.args[ 0 ] ).to.equal( 500 );
				expect( window.scrollTo.lastCall.args[ 1 ] ).to.equal( 300 );
				done();
			}
		} );
	} );
	it( 'window position y', done => {
		scrollTo( {
			x: 0,
			y: 100,
			duration: 1,
			onComplete: () => {
				expect( window.scrollTo.lastCall.args[ 0 ] ).to.equal( 0 );
				expect( window.scrollTo.lastCall.args[ 1 ] ).to.equal( 100 );
				done();
			}
		} );
	} );
} );
