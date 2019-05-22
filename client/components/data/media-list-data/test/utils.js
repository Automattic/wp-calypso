/** @format */

/**
 * External dependencies
 */

import utils from '../utils';

describe( 'utils', () => {
	describe( '#getMimeBaseTypeFromFilter()', () => {
		test( 'should return an empty string for an unknown filter', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'unknown' );

			expect( baseType ).toBe( '' );
		} );

		test( 'should return "image/" for "images"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'images' );

			expect( baseType ).toBe( 'image/' );
		} );

		test( 'should return "audio/" for "audio"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'audio' );

			expect( baseType ).toBe( 'audio/' );
		} );

		test( 'should return "video/" for "videos"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'videos' );

			expect( baseType ).toBe( 'video/' );
		} );

		test( 'should return "application/" for "documents"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'documents' );

			expect( baseType ).toBe( 'application/' );
		} );
	} );
} );
