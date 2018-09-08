/** @format */

/**
 * Internal dependencies
 */
import getGutenbergCurrentPost from 'state/selectors/get-gutenberg-current-post';

describe( 'getGutenbergCurrentPost()', () => {
	test( 'should return null if there are no current post for Gutenberg', () => {
		const currentPost = getGutenbergCurrentPost( {} );

		expect( currentPost ).toBeNull();
	} );

	test( 'should return the current loaded post for Gutenberg', () => {
		const state = { gutenberg: { currentPost: { id: 1 } } };
		const currentPost = getGutenbergCurrentPost( state );

		expect( currentPost ).toMatchObject( { id: 1 } );
	} );
} );
