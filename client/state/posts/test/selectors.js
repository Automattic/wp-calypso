import PostQueryManager from 'calypso/lib/query-manager/post';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import {
	getPost,
	getSitePost,
	getPostsForQuery,
	isRequestingPostsForQuery,
	getPostPreviewUrl,
} from '../selectors';

describe( 'selectors', () => {
	beforeEach( () => {
		getSitePost.memoizedSelector.cache.clear();
		getPostsForQuery.memoizedSelector.cache.clear();
	} );

	describe( '#getPost()', () => {
		test( 'should return null if the global ID is not tracked', () => {
			const post = getPost(
				{
					posts: {
						items: {},
						queries: {},
					},
				},
				'3d097cb7c5473c169bba0eb8e3c6cb64'
			);

			expect( post ).toBeNull();
		} );

		test( 'should return null if there is no manager associated with the path site', () => {
			const post = getPost(
				{
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
						},
						queries: {},
					},
				},
				'3d097cb7c5473c169bba0eb8e3c6cb64'
			);

			expect( post ).toBeNull();
		} );

		test( 'should return the object for the post global ID', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
			};
			const post = getPost(
				{
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
						},
						queries: {
							2916284: new PostQueryManager( {
								items: { 841: postObject },
							} ),
						},
					},
				},
				'3d097cb7c5473c169bba0eb8e3c6cb64'
			);

			expect( post ).toEqual( postObject );
		} );
	} );

	describe( '#getSitePost()', () => {
		test( 'should return null if the post is not known for the site', () => {
			const post = getSitePost(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				413
			);

			expect( post ).toBeNull();
		} );

		test( 'should return the object for the post site ID, post ID pair', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			};
			const post = getSitePost(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: { 841: postObject },
							} ),
						},
					},
				},
				2916284,
				841
			);

			expect( post ).toEqual( postObject );
		} );
	} );

	describe( '#getPostsForQuery()', () => {
		test( 'should return null if the site query is not tracked', () => {
			const sitePosts = getPostsForQuery(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Ribs' }
			);

			expect( sitePosts ).toBeNull();
		} );

		test( 'should return null if the query is not tracked to the query manager', () => {
			const sitePosts = getPostsForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {},
								queries: {},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Ribs' }
			);

			expect( sitePosts ).toBeNull();
		} );

		test( 'should return an array of normalized known queried posts', () => {
			const sitePosts = getPostsForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Ribs &amp; Chicken',
									},
								},
								queries: {
									'[["search","Ribs"]]': {
										itemKeys: [ 841 ],
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Ribs' }
			);

			expect( sitePosts ).toEqual( [
				{
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Ribs & Chicken',
				},
			] );
		} );

		test( "should return null if we know the number of found items but the requested set hasn't been received", () => {
			const sitePosts = getPostsForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									1204: {
										ID: 1204,
										site_ID: 2916284,
										global_ID: '48b6010b559efe6a77a429773e0cbf12',
										title: 'Sweet &amp; Savory',
									},
								},
								queries: {
									'[["search","Sweet"]]': {
										itemKeys: [ 1204, undefined ],
										found: 2,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Sweet', number: 1, page: 2 }
			);

			expect( sitePosts ).toBeNull();
		} );
	} );

	describe( '#isRequestingPostsForQuery()', () => {
		test( 'should return false if the site has not been queried', () => {
			const isRequesting = isRequestingPostsForQuery(
				{
					posts: {
						queryRequests: {},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if the site has not been queried for the specific query', () => {
			const isRequesting = isRequestingPostsForQuery(
				{
					posts: {
						queryRequests: {
							'2916284:{"search":"Hel"}': true,
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if the site has been queried for the specific query', () => {
			const isRequesting = isRequestingPostsForQuery(
				{
					posts: {
						queryRequests: {
							'2916284:{"search":"Hello"}': true,
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( isRequesting ).toBe( true );
		} );

		test( 'should return false if the site has previously, but is not currently, querying for the specified query', () => {
			const isRequesting = isRequestingPostsForQuery(
				{
					posts: {
						queryRequests: {
							'2916284:{"search":"Hello"}': false,
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( isRequesting ).toBe( false );
		} );
	} );

	describe( 'getPostPreviewUrl()', () => {
		test( 'should return null if the post is not known', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toBeNull();
		} );

		test( 'should return null if the post has no URL', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									},
								},
							} ),
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toBeNull();
		} );

		test( 'should return null if the post is trashed', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										URL: 'http://example.com/post-url',
										status: 'trash',
									},
								},
							} ),
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toBeNull();
		} );

		test( 'should prefer the post preview URL if available', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										URL: 'http://example.com/post-url',
										preview_URL: 'https://example.com/preview-url',
									},
								},
							} ),
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toEqual( 'https://example.com/preview-url' );
		} );

		test( 'should use post URL if preview URL not available', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										URL: 'https://example.com/post-url',
									},
								},
							} ),
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toEqual( 'https://example.com/post-url' );
		} );

		test( 'should change http to https if mapped domain', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										URL: 'http://example.com/post-url',
									},
								},
							} ),
						},
					},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'http://example.com',
								options: {
									unmapped_url: 'https://example.wordpress.com',
									is_mapped_domain: true,
								},
							},
						},
					},
					siteSettings: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toEqual( 'https://example.wordpress.com/post-url' );
		} );

		test( 'should append preview query argument to non-published posts', () => {
			const previewUrl = getPostPreviewUrl(
				{
					...userState,
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'draft',
										URL: 'https://example.com/post-url?other_arg=1',
									},
								},
							} ),
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				841
			);

			expect( previewUrl ).toEqual( 'https://example.com/post-url?other_arg=1&preview=true' );
		} );
	} );
} );
