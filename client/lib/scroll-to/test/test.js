require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal Dependencies
 */
const scrollTo = require( '../' ); // needs window so import must be sync

describe( 'scroll-to', function() {
	beforeEach( function() {
		sinon.spy( window, 'scrollTo' );
	} );
	afterEach( function() {
		window.scrollTo.restore();
	} );
	it( 'window position x', function( done ) {
		scrollTo( {
			x: 500,
			y: 300,
			duration: 1,
			onComplete: function() {
				expect( window.scrollTo.lastCall.args[0] ).to.equal( 500 );
				expect( window.scrollTo.lastCall.args[1] ).to.equal( 300 );
				done();
			}
		} );
	} );
	it( 'window position y', function( done ) {
		scrollTo( {
			x: 0,
			y: 100,
			duration: 1,
			onComplete: function() {
				expect( window.scrollTo.lastCall.args[0] ).to.equal( 0 );
				expect( window.scrollTo.lastCall.args[1] ).to.equal( 100 );
				done();
			}
		} );
	} );
} );
