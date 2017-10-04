/** @format */
/**
 * External dependencies
 */
var expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var utils = require( '../utils' );

describe( 'utils', function() {
	describe( '#getMimeBaseTypeFromFilter()', function() {
		it( 'should return an empty string for an unknown filter', function() {
			var baseType = utils.getMimeBaseTypeFromFilter( 'unknown' );

			expect( baseType ).to.equal( '' );
		} );

		it( 'should return "image/" for "images"', function() {
			var baseType = utils.getMimeBaseTypeFromFilter( 'images' );

			expect( baseType ).to.equal( 'image/' );
		} );

		it( 'should return "audio/" for "audio"', function() {
			var baseType = utils.getMimeBaseTypeFromFilter( 'audio' );

			expect( baseType ).to.equal( 'audio/' );
		} );

		it( 'should return "video/" for "videos"', function() {
			var baseType = utils.getMimeBaseTypeFromFilter( 'videos' );

			expect( baseType ).to.equal( 'video/' );
		} );

		it( 'should return "application/" for "documents"', function() {
			var baseType = utils.getMimeBaseTypeFromFilter( 'documents' );

			expect( baseType ).to.equal( 'application/' );
		} );
	} );
} );
