import { getEditorPostId } from '../selectors';

describe( 'selectors', () => {
	describe( '#getEditorPostId()', () => {
		test( 'should return the current editor post ID', () => {
			const postId = getEditorPostId( {
				editor: {
					postId: 183,
				},
			} );

			expect( postId ).toEqual( 183 );
		} );
	} );
} );
