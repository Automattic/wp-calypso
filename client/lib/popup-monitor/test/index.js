global.window = { screenTop: 0, screenLeft: 0, innerWidth: 1280, innerHeight: 720 };

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var PopupMonitor = require( '../' );

describe( 'PopupMonitor', function() {
	var popupMonitor;

	beforeEach( function() {
		popupMonitor = new PopupMonitor();
	} );

	describe( '#getScreenCenterSpecs()', function() {
		it( 'should generate a popup specification string given the desired width and height', function() {
			var specs = popupMonitor.getScreenCenterSpecs( 650, 500 );

			expect( specs ).to.equal( 'width=650,height=500,top=110,left=315' );
		} );
	} );
} );
