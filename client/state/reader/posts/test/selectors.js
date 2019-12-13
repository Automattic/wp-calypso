/**
 * Internal dependencies
 */
import { getPostById, getPostByKey, getPostsByKeys } from '../selectors';

describe( 'selectors', () => {
	const post1 = { global_ID: 1111, ID: 1, site_ID: 1, feed_ID: 2 };
	const post2 = { global_ID: 2222, feed_item_ID: 1, feed_ID: 10 };
	const state = {
		reader: { posts: { items: { [ post1.global_ID ]: post1, [ post2.global_ID ]: post2 } } },
	};

	describe( '#getPostById()', () => {
		test( 'returns undefined for nonexistent post id', () => {
			expect( getPostById( state, 0 ) ).toBe( undefined );
		} );

		test( 'returns the post for a given post id', () => {
			expect( getPostById( state, 1111 ) ).toBe( post1 );
			expect( getPostById( state, 2222 ) ).toBe( post2 );
		} );

		test( 'should return a referentially equal post for the same input', () => {
			const call1 = getPostById( state, 1111 );
			const call2 = getPostById( state, 1111 );
			expect( call1 ).toBe( call2 );
		} );
	} );

	describe( '#getPostByKey()', () => {
		test( 'returns falsy for anything not resembling a postKey', () => {
			expect( getPostByKey( state, 0 ) ).toBeFalsy();
			expect( getPostByKey( state, 'postKey' ) ).toBeFalsy();
			expect( getPostByKey( state, {} ) ).toBeFalsy();
			expect( getPostByKey( state, null ) ).toBeFalsy();
		} );

		test( 'returns the post for a given blog postKey', () => {
			expect( getPostByKey( state, { postId: 1, blogId: 1 } ) ).toBe( post1 );
		} );

		test( 'returns the post for a given feed postKey', () => {
			expect( getPostByKey( state, { postId: 1, feedId: 10 } ) ).toBe( post2 );
		} );

		test( 'should return a referentially equal post for the same posts within state', () => {
			const call1 = getPostByKey( { ...state }, { postId: 1, feedId: 10 } );
			const call2 = getPostByKey(
				{ reader: { posts: { items: { ...state.reader.posts.items } } } },
				{ postId: 1, feedId: 10 }
			);
			expect( call1 ).toBe( call2 );
		} );
	} );

	describe( '#getPostsByKeys()', () => {
		test( 'returns falsy for anything not resembling an array of postKeys', () => {
			expect( getPostByKey( state, 0 ) ).toBeFalsy();
			expect( getPostByKey( state, 'postKey' ) ).toBeFalsy();
			expect( getPostByKey( state, {} ) ).toBeFalsy();
			expect( getPostByKey( state, null ) ).toBeFalsy();
			expect( getPostByKey( state, [] ) ).toBeFalsy();
		} );

		test( 'returns the post for a given array of postKeys', () => {
			const posts = getPostsByKeys( state, [
				{ postId: 1, blogId: 1 },
				{ postId: 1, feedId: 10 },
			] );
			expect( posts ).toEqual( [ post1, post2 ] );
		} );

		test( 'should return a referentially equal post for the same posts within state', () => {
			const call1 = getPostsByKeys( state, [
				{ postId: 1, blogId: 1 },
				{ postId: 1, feedId: 10 },
			] );
			const call2 = getPostsByKeys( state, [
				{ postId: 1, blogId: 1 },
				{ postId: 1, feedId: 10 },
			] );

			expect( call1 ).toBe( call2 );
		} );
	} );
} );
