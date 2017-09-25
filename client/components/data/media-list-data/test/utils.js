/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import utils from '../utils';

describe( 'utils', function() {
	describe( '#getMimeBaseTypeFromFilter()', function() {
		it( 'should return an empty string for an unknown filter', function() {
			const baseType = utils.getMimeBaseTypeFromFilter( 'unknown' );

			expect( baseType ).to.equal( '' );
		} );

		it( 'should return "image/" for "images"', function() {
			const baseType = utils.getMimeBaseTypeFromFilter( 'images' );

			expect( baseType ).to.equal( 'image/' );
		} );

		it( 'should return "audio/" for "audio"', function() {
			const baseType = utils.getMimeBaseTypeFromFilter( 'audio' );

			expect( baseType ).to.equal( 'audio/' );
		} );

		it( 'should return "video/" for "videos"', function() {
			const baseType = utils.getMimeBaseTypeFromFilter( 'videos' );

			expect( baseType ).to.equal( 'video/' );
		} );

		it( 'should return "application/" for "documents"', function() {
			const baseType = utils.getMimeBaseTypeFromFilter( 'documents' );

			expect( baseType ).to.equal( 'application/' );
		} );
	} );
} );
