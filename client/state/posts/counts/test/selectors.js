import {
	isRequestingPostCounts,
	getAllPostCounts,
	getAllPostCount,
	getMyPostCounts,
	getNormalizedPostCounts,
	getNormalizedMyPostCounts,
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

	describe( 'getNormalizedPostCounts()', () => {
		test( 'should return normalized post counts using selector', () => {
			const postCounts = getNormalizedPostCounts(
				{
					posts: {
						counts: {
							counts: {
								2916284: {
									post: {
										all: {},
										mine: {
											publish: 1,
											private: 1,
											draft: 2,
											pending: 1,
											future: 2,
											badstatus: 10,
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'post',
				getMyPostCounts
			);

			expect( postCounts ).toEqual( {
				publish: 2,
				draft: 3,
				future: 2,
				trash: 0,
			} );
		} );

		test( 'should default to returning all counts', () => {
			const postCounts = getNormalizedPostCounts(
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
				'post'
			);

			expect( postCounts ).toEqual( {
				publish: 1,
				draft: 0,
				future: 0,
				trash: 0,
			} );
		} );
	} );

	describe( 'getNormalizedMyPostCounts()', () => {
		test( 'should return normalized post counts for mine counts', () => {
			const postCounts = getNormalizedMyPostCounts(
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
				draft: 0,
				future: 0,
				trash: 0,
			} );
		} );
	} );
} );
