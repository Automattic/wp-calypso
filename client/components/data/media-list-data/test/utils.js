/** @format */

/**
 * External dependencies
 */

import { expect } from 'chai';

/**
 * Internal dependencies
 */
import utils from '../utils';

describe( 'utils', () => {
	describe( '#getMimeBaseTypeFromFilter()', () => {
		test( 'should return an empty string for an unknown filter', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'unknown' );

			expect( baseType ).to.equal( '' );
		} );

		test( 'should return "image/" for "images"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'images' );

			expect( baseType ).to.equal( 'image/' );
		} );

		test( 'should return "audio/" for "audio"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'audio' );

			expect( baseType ).to.equal( 'audio/' );
		} );

		test( 'should return "video/" for "videos"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'videos' );

			expect( baseType ).to.equal( 'video/' );
		} );

		test( 'should return "application/" for "documents"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'documents' );

			expect( baseType ).to.equal( 'application/' );
		} );
	} );
} );
