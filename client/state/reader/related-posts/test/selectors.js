import { shouldFetchRelated, relatedPostsForPost } from '../selectors';

describe( 'selectors', () => {
	describe( 'shouldFetchRelated', () => {
		test( 'should return true if no key present', () => {
			expect(
				shouldFetchRelated(
					{
						reader: {
							relatedPosts: {
								queuedRequests: {},
								items: {},
							},
						},
					},
					1,
					1
				)
			).toBe( true );
		} );
		test( 'should return false if key present', () => {
			expect(
				shouldFetchRelated(
					{
						reader: {
							relatedPosts: {
								queuedRequests: {
									'1-1-all-2': true,
								},
								items: {},
							},
						},
					},
					1,
					1
				)
			).toBe( false );
		} );

		test( 'should return false if we have a value', () => {
			expect(
				shouldFetchRelated(
					{
						reader: {
							relatedPosts: {
								queuedRequests: {},
								items: {
									'1-1-all-2': [],
								},
							},
						},
					},
					1,
					1
				)
			).toBe( false );
		} );
	} );

	describe( 'relatedPostsForPost', () => {
		test( 'should return the posts that are there', () => {
			expect(
				relatedPostsForPost(
					{
						reader: {
							relatedPosts: {
								items: {
									'1-1-all-2': [ 1, 2 ],
								},
							},
						},
					},
					1,
					1
				)
			).toEqual( [ 1, 2 ] );
		} );

		test( 'should return undefined if nothing present', () => {
			expect(
				relatedPostsForPost(
					{
						reader: {
							relatedPosts: {
								items: {
									'1-2-all-2': [ 1, 2 ],
								},
							},
						},
					},
					1,
					1
				)
			).toBeUndefined();
		} );
	} );
} );
