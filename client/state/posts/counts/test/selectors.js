import {
	isRequestingPostCounts,
	getAllPostCounts,
	getAllPostCount,
	getMyPostCounts,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostCounts()', () => {
		test( 'should return false if no request has been made', () => {
			const isRequesting = isRequestingPostCounts(
				{
					posts: {
						counts: {
							requesting: {},
						},
					},
				},
				2916284,
				'post'
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if a request has finished', () => {
			const isRequesting = isRequestingPostCounts(
				{
					posts: {
						counts: {
							requesting: {
								2916284: {
									post: false,
								},
							},
						},
					},
				},
				2916284
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingPostCounts(
				{
					posts: {
						counts: {
							requesting: {
								2916284: {
									post: true,
								},
							},
						},
					},
				},
				2916284
			);

			expect( isRequesting ).toBe( false );
		} );
	} );

	describe( '#getAllPostCounts()', () => {
		test( "should return null if counts haven't been received for site", () => {
			const postCounts = getAllPostCounts(
				{
					posts: {
						counts: {},
					},
				},
				2916284,
				'post'
			);

			expect( postCounts ).toBeNull();
		} );

		test( 'should return post counts for all statuses', () => {
			const postCounts = getAllPostCounts(
				{
					posts: {
						counts: {
							counts: {
								2916284: {
									post: {
										all: {
											publish: 2,
										},
										mine: {},
									},
								},
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( postCounts ).toEqual( {
				publish: 2,
			} );
		} );
	} );

	describe( '#getAllPostCount()', () => {
		test( "should return null if post counts haven't been received for site", () => {
			const postCount = getAllPostCount(
				{
					posts: {
						counts: {
							counts: {},
						},
					},
				},
				2916284,
				'post',
				'publish'
			);

			expect( postCount ).toBeNull();
		} );

		test( 'should return post count for status', () => {
			const postCount = getAllPostCount(
				{
					posts: {
						counts: {
							counts: {
								2916284: {
									post: {
										all: {
											publish: 2,
										},
										mine: {},
									},
								},
							},
						},
					},
				},
				2916284,
				'post',
				'publish'
			);

			expect( postCount ).toEqual( 2 );
		} );

		test( 'should return 0 if post counts have been received for site, but no status key exists', () => {
			const postCount = getAllPostCount(
				{
					posts: {
						counts: {
							counts: {
								2916284: {
									post: {
										all: {
											publish: 1,
										},
										mine: {},
									},
								},
							},
						},
					},
				},
				2916284,
				'post',
				'draft'
			);

			expect( postCount ).toEqual( 0 );
		} );
	} );

	describe( '#getMyPostCounts()', () => {
		test( "should return null if counts haven't been received for site", () => {
			const postCounts = getMyPostCounts(
				{
					posts: {
						counts: {},
					},
				},
				2916284,
				'post'
			);

			expect( postCounts ).toBeNull();
		} );

		test( 'should return post counts for all statuses', () => {
			const postCounts = getMyPostCounts(
				{
					posts: {
						counts: {
							counts: {
								2916284: {
									post: {
										all: {},
										mine: {
											publish: 1,
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( postCounts ).toEqual( {
				publish: 1,
			} );
		} );
	} );
} );
