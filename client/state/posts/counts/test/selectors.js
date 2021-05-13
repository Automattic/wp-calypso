/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingPostCounts,
	getAllPostCounts,
	getAllPostCount,
	getMyPostCounts,
	getMyPostCount,
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

			expect( isRequesting ).to.be.false;
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

			expect( isRequesting ).to.be.false;
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

			expect( isRequesting ).to.be.false;
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

			expect( postCounts ).to.be.null;
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

			expect( postCounts ).to.eql( {
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

			expect( postCount ).to.be.null;
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

			expect( postCount ).to.equal( 2 );
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

			expect( postCount ).to.equal( 0 );
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

			expect( postCounts ).to.be.null;
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

			expect( postCounts ).to.eql( {
				publish: 1,
			} );
		} );
	} );

	describe( '#getMyPostCount()', () => {
		test( "should return null if post counts haven't been received for site", () => {
			const postCount = getMyPostCount(
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

			expect( postCount ).to.be.null;
		} );

		test( 'should return post count for status', () => {
			const postCount = getMyPostCount(
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
				'post',
				'publish'
			);

			expect( postCount ).to.equal( 1 );
		} );

		test( 'should return 0 if post counts have been received for site, but no status key exists', () => {
			const postCount = getMyPostCount(
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
				'post',
				'draft'
			);

			expect( postCount ).to.equal( 0 );
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

			expect( postCounts ).to.eql( {
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

			expect( postCounts ).to.eql( {
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

			expect( postCounts ).to.eql( {
				publish: 1,
				draft: 0,
				future: 0,
				trash: 0,
			} );
		} );
	} );
} );
