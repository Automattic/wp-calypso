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

		describe( 'verify getPostMapByPostKey method', () => {
			test( 'returns the same post when looked up by blogId or feedId key format', () => {
				const post = { global_ID: 3333, ID: 5, site_ID: 100, feed_ID: 200, feed_item_ID: 50 };
				const newState = {
					reader: { posts: { items: { [ post.global_ID ]: post } } },
				};

				const byBlogKey = getPostByKey( newState, { postId: 5, blogId: 100 } );
				const byFeedKey = getPostByKey( newState, { postId: 50, feedId: 200 } );

				expect( byBlogKey ).toBe( post );
				expect( byFeedKey ).toBe( post );
				expect( byBlogKey ).toBe( byFeedKey );
			} );

			test( 'returns the same post for any of multiple feed_item_IDs', () => {
				const post = {
					global_ID: 4444,
					ID: 6,
					site_ID: 101,
					feed_ID: 201,
					feed_item_ID: 60,
					feed_item_IDs: [ 60, 61, 62 ],
				};
				const newState = {
					reader: { posts: { items: { [ post.global_ID ]: post } } },
				};

				const byFirstFeedItemId = getPostByKey( newState, { postId: 60, feedId: 201 } );
				const bySecondFeedItemId = getPostByKey( newState, { postId: 61, feedId: 201 } );
				const byThirdFeedItemId = getPostByKey( newState, { postId: 62, feedId: 201 } );
				const byBlogKey = getPostByKey( newState, { postId: 6, blogId: 101 } );

				expect( byFirstFeedItemId ).toBe( post );
				expect( bySecondFeedItemId ).toBe( post );
				expect( byThirdFeedItemId ).toBe( post );
				expect( byBlogKey ).toBe( post );
			} );
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
