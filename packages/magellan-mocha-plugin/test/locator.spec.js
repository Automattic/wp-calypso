/* eslint no-undef: 0, no-unused-expressions: 0, filenames/filenames: 0 */
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var Locator = require( '../lib/locator' );

describe( 'locator', function () {
	it( 'should convert to string', function () {
		var a = new Locator( 'a' );
		expect( a.toString() ).to.eql( 'a' );
	} );
} );
