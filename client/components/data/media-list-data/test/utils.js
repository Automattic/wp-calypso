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

	describe( '#convertMimeFilter()', () => {
		test( 'show return video for videos type', () => {
			const filter = utils.convertMimeFilter( 'videos' );

			expect( filter ).to.equal( 'video' );
		} );

		test( 'show return photo for images type', () => {
			const filter = utils.convertMimeFilter( 'images' );

			expect( filter ).to.equal( 'photo' );
		} );

		test( 'show return null for unsupported type', () => {
			const filter = utils.convertMimeFilter( 'cats' );

			expect( filter ).to.equal( null );
		} );
	} );

	describe( '#getGoogleQuery()', () => {
		test( 'show return original query when no category or filter', () => {
			const original = { source: 'google_photos' };
			const google = utils.getGoogleQuery( original, {} );

			expect( google ).to.eql( original );
		} );

		test( 'show return media type filter when supplied', () => {
			const original = { filter: 'videos' };
			const expected = { filter: [ 'mediaType=video' ] };
			const google = utils.getGoogleQuery( {}, original );

			expect( google ).to.eql( expected );
		} );

		test( 'show return category filter when supplied', () => {
			const original = { categoryFilter: 'cats' };
			const expected = { filter: [ 'categoryInclude=cats' ] };
			const google = utils.getGoogleQuery( {}, original );

			expect( google ).to.eql( expected );
		} );

		test( 'show return category and media type filter when supplied', () => {
			const original = { categoryFilter: 'cats', filter: 'videos' };
			const expected = { filter: [ 'mediaType=video', 'categoryInclude=cats' ] };
			const google = utils.getGoogleQuery( {}, original );

			expect( google ).to.eql( expected );
		} );
	} );
} );
