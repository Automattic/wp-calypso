import utils from '../utils';

describe( 'utils', () => {
	describe( '#getMimeBaseTypeFromFilter()', () => {
		test( 'should return an empty string for an unknown filter', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'unknown' );

			expect( baseType ).toEqual( '' );
		} );

		test( 'should return "image/" for "images"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'images' );

			expect( baseType ).toEqual( 'image/' );
		} );

		test( 'should return "audio/" for "audio"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'audio' );

			expect( baseType ).toEqual( 'audio/' );
		} );

		test( 'should return "video/" for "videos"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'videos' );

			expect( baseType ).toEqual( 'video/' );
		} );

		test( 'should return "application/" for "documents"', () => {
			const baseType = utils.getMimeBaseTypeFromFilter( 'documents' );

			expect( baseType ).toEqual( 'application/' );
		} );
	} );

	describe( '#convertMimeFilter()', () => {
		test( 'show return video for videos type', () => {
			const filter = utils.convertMimeFilter( 'videos' );

			expect( filter ).toEqual( 'video' );
		} );

		test( 'show return photo for images type', () => {
			const filter = utils.convertMimeFilter( 'images' );

			expect( filter ).toEqual( 'photo' );
		} );

		test( 'show return null for unsupported type', () => {
			const filter = utils.convertMimeFilter( 'cats' );

			expect( filter ).toBeNull();
		} );
	} );
} );
