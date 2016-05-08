/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' );

/**
 * Module variables
 */
var DUMMY_SITE_ID = 1,
	DUMMY_POST_FORMATS = { image: 'Image' };

describe( 'store', function() {
	var PostFormatsStore, handler;

	before( function() {
		sinon.spy( Dispatcher, 'register' );
		PostFormatsStore = require( '../store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( function() {
		PostFormatsStore._formats = {};
	} );

	after( function() {
		Dispatcher.register.restore();
	} );

	function dispatchReceivePostFormats() {
		handler( {
			action: {
				type: 'RECEIVE_POST_FORMATS',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_POST_FORMATS
			}
		} );
	}

	describe( '#get()', function() {
		it( 'should return undefined for a site where data does not exist', function() {
			expect( PostFormatsStore.get( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		it( 'should return an array of post format objects for a site where data has been received', function() {
			dispatchReceivePostFormats();

			expect( PostFormatsStore.get( DUMMY_SITE_ID ) ).to.eql( [
				{
					slug: 'image',
					label: 'Image'
				}
			] );
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should emit a change event when receiving updates', function( done ) {
			PostFormatsStore.on( 'change', done );

			dispatchReceivePostFormats();
		} );
	} );
} );
