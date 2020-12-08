/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { values } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	getPost,
	getNormalizedPost,
	getSitePosts,
	getSitePost,
	getPostsForQuery,
	isPostPublished,
	isRequestingPostsForQuery,
	getPostsFoundForQuery,
	getPostsLastPageForQuery,
	isPostsLastPageForQuery,
	getPostsForQueryIgnoringPage,
	isRequestingPostsForQueryIgnoringPage,
	isEditedPostPasswordProtected,
	isEditedPostPasswordProtectedWithValidPassword,
	getEditedPost,
	getPostEdits,
	getEditedPostValue,
	getEditedPostSlug,
	isEditedPostDirty,
	getPostPreviewUrl,
	getSitePostsByTerm,
} from '../selectors';
import PostQueryManager from 'calypso/lib/query-manager/post';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';

describe( 'selectors', () => {
	beforeEach( () => {
		getSitePosts.memoizedSelector.cache.clear();
		getSitePost.memoizedSelector.cache.clear();
		getPostsForQueryIgnoringPage.memoizedSelector.cache.clear();
		isRequestingPostsForQueryIgnoringPage.memoizedSelector.cache.clear();
		getNormalizedPost.memoizedSelector.cache.clear();
		getPostsForQuery.memoizedSelector.cache.clear();
		getPostsForQueryIgnoringPage.memoizedSelector.cache.clear();
		isPostPublished.memoizedSelector.cache.clear();
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

			expect( post ).to.be.null;
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

			expect( post ).to.be.null;
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

			expect( post ).to.equal( postObject );
		} );
	} );

	describe( 'getNormalizedPost()', () => {
		test( 'should return null if the post is not tracked', () => {
			const normalizedPost = getNormalizedPost(
				{
					posts: {
						items: {},
						queries: {},
					},
				},
				'3d097cb7c5473c169bba0eb8e3c6cb64'
			);

			expect( normalizedPost ).to.be.null;
		} );

		test( 'should return a normalized copy of the post', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				author: {
					name: 'Badman <img onerror= />',
				},
				post_thumbnail: {
					URL: 'https://example.com/logo.png',
					width: 700,
					height: 200,
				},
			};

			const normalizedPost = getNormalizedPost(
				deepFreeze( {
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
				} ),
				'3d097cb7c5473c169bba0eb8e3c6cb64'
			);

			expect( normalizedPost ).to.not.equal( postObject );
			expect( normalizedPost ).to.eql( {
				...postObject,
				title: 'Ribs & Chicken',
				author: {
					name: 'Badman ',
				},
				canonical_image: {
					uri: 'https://example.com/logo.png',
					width: 700,
					height: 200,
				},
			} );
		} );
	} );

	describe( '#getSitePosts()', () => {
		test( 'should return an array of post objects for the site', () => {
			const postObjects = {
				2916284: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
					},
					'6c831c187ffef321eb43a67761a525a3': {
						ID: 413,
						site_ID: 2916284,
						global_ID: '6c831c187ffef321eb43a67761a525a3',
						title: 'Ribs &amp; Chicken',
					},
				},
				77203074: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: 77203074,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs',
					},
				},
			};
			const state = {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: postObjects[ 2916284 ],
						} ),
						77203074: new PostQueryManager( {
							items: postObjects[ 77203074 ],
						} ),
					},
				},
			};

			expect( getSitePosts( state, 2916284 ) ).to.have.members( values( postObjects[ 2916284 ] ) );
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

			expect( post ).to.be.null;
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

			expect( post ).to.equal( postObject );
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

			expect( sitePosts ).to.be.null;
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

			expect( sitePosts ).to.be.null;
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

			expect( sitePosts ).to.eql( [
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

			expect( sitePosts ).to.be.null;
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

			expect( isRequesting ).to.be.false;
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

			expect( isRequesting ).to.be.false;
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

			expect( isRequesting ).to.be.true;
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

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( 'getPostsFoundForQuery()', () => {
		test( 'should return null if the site query is not tracked', () => {
			const found = getPostsFoundForQuery(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( found ).to.be.null;
		} );

		test( 'should return the found items for a site query', () => {
			const found = getPostsFoundForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [ 841 ],
										found: 1,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( found ).to.equal( 1 );
		} );

		test( 'should return zero if in-fact there are zero items', () => {
			const found = getPostsFoundForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [],
										found: 0,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( found ).to.equal( 0 );
		} );
	} );

	describe( '#getPostsLastPageForQuery()', () => {
		test( 'should return null if the site query is not tracked', () => {
			const lastPage = getPostsLastPageForQuery(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( lastPage ).to.be.null;
		} );

		test( 'should return the last page value for a site query', () => {
			const lastPage = getPostsLastPageForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [ 841 ],
										found: 1,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( lastPage ).to.equal( 1 );
		} );

		test( 'should return the last page value for a site query, even if including page param', () => {
			const lastPage = getPostsLastPageForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [ 841 ],
										found: 4,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello', page: 3, number: 1 }
			);

			expect( lastPage ).to.equal( 4 );
		} );

		test( 'should return 1 if there are no found posts', () => {
			const lastPage = getPostsLastPageForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [],
										found: 0,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( lastPage ).to.equal( 1 );
		} );
	} );

	describe( '#isPostsLastPageForQuery()', () => {
		test( 'should return null if the last page is not known', () => {
			const isLastPage = isPostsLastPageForQuery(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				{ search: 'Hello' }
			);

			expect( isLastPage ).to.be.null;
		} );

		test( 'should return false if the query explicit value is not the last page', () => {
			const isLastPage = isPostsLastPageForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [ 841 ],
										found: 4,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello', page: 3, number: 1 }
			);

			expect( isLastPage ).to.be.false;
		} );

		test( 'should return true if the query explicit value is the last page', () => {
			const isLastPage = isPostsLastPageForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [ 841 ],
										found: 4,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello', page: 4, number: 1 }
			);

			expect( isLastPage ).to.be.true;
		} );

		test( 'should return true if the query implicit value is the last page', () => {
			const isLastPage = isPostsLastPageForQuery(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
								queries: {
									'[["search","Hello"]]': {
										itemKeys: [ 841 ],
										found: 1,
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: 'Hello', number: 1 }
			);

			expect( isLastPage ).to.be.true;
		} );
	} );

	describe( '#getPostsForQueryIgnoringPage()', () => {
		test( 'should return null if the query is not tracked', () => {
			const sitePosts = getPostsForQueryIgnoringPage(
				{
					posts: {
						items: {},
						queries: {},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);

			expect( sitePosts ).to.be.null;
		} );

		test( 'should return null if the query manager has not received items for query', () => {
			const sitePosts = getPostsForQueryIgnoringPage(
				{
					posts: {
						items: {},
						queries: {
							2916284: new PostQueryManager( {
								items: {},
								queries: {},
							} ),
						},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);

			expect( sitePosts ).to.be.null;
		} );

		test( 'should return a concatenated array of all site posts ignoring page', () => {
			const sitePosts = getPostsForQueryIgnoringPage(
				{
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': {
								ID: 841,
								site_ID: 2916284,
								global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
								title: 'Hello World',
							},
							'6c831c187ffef321eb43a67761a525a3': {
								ID: 413,
								site_ID: 2916284,
								global_ID: '6c831c187ffef321eb43a67761a525a3',
								title: 'Ribs &amp; Chicken',
							},
						},
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
									413: {
										ID: 413,
										site_ID: 2916284,
										global_ID: '6c831c187ffef321eb43a67761a525a3',
										title: 'Ribs &amp; Chicken',
									},
								},
								queries: {
									'[]': {
										itemKeys: [ 841, 413 ],
									},
								},
							} ),
						},
					},
				},
				2916284,
				{ search: '', number: 1 }
			);

			expect( sitePosts ).to.eql( [
				{
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
				{
					ID: 413,
					site_ID: 2916284,
					global_ID: '6c831c187ffef321eb43a67761a525a3',
					title: 'Ribs & Chicken',
				},
			] );
		} );

		test( "should omit found items for which the requested result hasn't been received", () => {
			const sitePosts = getPostsForQueryIgnoringPage(
				{
					posts: {
						items: {
							'48b6010b559efe6a77a429773e0cbf12': {
								ID: 1204,
								site_ID: 2916284,
								global_ID: '48b6010b559efe6a77a429773e0cbf12',
								title: 'Sweet &amp; Savory',
							},
						},
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
				{ search: 'Sweet', number: 1 }
			);

			expect( sitePosts ).to.eql( [
				{
					ID: 1204,
					site_ID: 2916284,
					global_ID: '48b6010b559efe6a77a429773e0cbf12',
					title: 'Sweet & Savory',
				},
			] );
		} );
	} );

	describe( 'isRequestingPostsForQueryIgnoringPage()', () => {
		test( 'should return false if not requesting for query', () => {
			const isRequesting = isRequestingPostsForQueryIgnoringPage(
				{
					posts: {
						queryRequests: {},
					},
				},
				2916284,
				{ search: 'hel' }
			);

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true requesting for query at exact page', () => {
			const isRequesting = isRequestingPostsForQueryIgnoringPage(
				{
					posts: {
						queryRequests: {
							'2916284:{"search":"hel","page":4}': true,
						},
					},
				},
				2916284,
				{ search: 'hel', page: 4 }
			);

			expect( isRequesting ).to.be.true;
		} );

		test( 'should return true requesting for query without page specified', () => {
			const isRequesting = isRequestingPostsForQueryIgnoringPage(
				{
					posts: {
						queryRequests: {
							'2916284:{"search":"hel","page":4}': true,
						},
					},
				},
				2916284,
				{ search: 'hel' }
			);

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return true for all-sites query', () => {
			const isRequesting = isRequestingPostsForQueryIgnoringPage(
				{
					posts: {
						queryRequests: {
							'{"status":"publish,private","author":null}': true,
						},
					},
				},
				null, // siteId
				{ status: 'publish,private', author: null }
			);

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false for single site when requesting all sites', () => {
			const isRequesting = isRequestingPostsForQueryIgnoringPage(
				{
					posts: {
						queryRequests: {
							'{"status":"publish,private","author":null}': true,
						},
					},
				},
				2916284,
				{ status: 'publish,private', author: null }
			);

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( '#getEditedPost()', () => {
		beforeEach( () => {
			getEditedPost.memoizedSelector.cache.clear();
		} );

		test( 'should return the original post if no revisions exist on site', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			};
			const editedPost = getEditedPost(
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
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( editedPost ).to.equal( postObject );
		} );

		test( 'should return revisions for a new draft', () => {
			const editedPost = getEditedPost(
				{
					posts: {
						items: {},
						queries: {},
						edits: {
							2916284: {
								'': [ { title: 'Ribs &amp; Chicken' } ],
							},
						},
					},
				},
				2916284,
				null
			);

			expect( editedPost ).to.eql( { title: 'Ribs &amp; Chicken' } );
		} );

		test( 'should return revisions for a draft if the original is unknown', () => {
			const editedPost = getEditedPost(
				{
					posts: {
						items: {},
						queries: {},
						edits: {
							2916284: {
								841: [ { title: 'Hello World!' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( editedPost ).to.eql( { title: 'Hello World!' } );
		} );

		test( 'should return revisions merged with the original post', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			};
			const editedPost = getEditedPost(
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
						edits: {
							2916284: {
								841: [ { title: 'Hello World!' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( editedPost ).to.eql( { ...postObject, title: 'Hello World!' } );
		} );

		test( 'should return revisions merged with original post nested properties', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				discussion: {
					comments_open: true,
				},
			};
			const editedPost = getEditedPost(
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
						edits: {
							2916284: {
								841: [
									{
										discussion: {
											pings_open: true,
										},
									},
								],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( editedPost ).to.eql( {
				...postObject,
				discussion: {
					comments_open: true,
					pings_open: true,
				},
			} );
		} );

		test( 'should return revisions with array properties overwriting objects', () => {
			// This tests the initial edit of a non-hierarchical taxonomy
			// TODO avoid changing the shape of the `terms` state - see:
			// https://github.com/Automattic/wp-calypso/pull/6548#issuecomment-233148766
			const editedPost = getEditedPost(
				{
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
						},
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										terms: {
											post_tag: {
												tag1: { ID: 1 },
												tag2: { ID: 2 },
											},
											category: {
												category3: { ID: 3 },
												category4: { ID: 4 },
											},
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [
									{
										terms: {
											post_tag: [ 'tag2', 'tag3' ],
										},
									},
								],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( editedPost ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				terms: {
					post_tag: [ 'tag2', 'tag3' ],
					category: {
						category3: { ID: 3 },
						category4: { ID: 4 },
					},
				},
			} );
		} );

		test( 'should return revisions with array properties overwriting previous versions', () => {
			// This tests removal of a term from a non-hierarchical taxonomy
			const editedPost = getEditedPost(
				{
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
						},
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										terms: {
											post_tag: [ 'tag1', 'tag2' ],
											category: {
												category3: { ID: 3 },
												category4: { ID: 4 },
											},
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [
									{
										terms: {
											post_tag: [ 'tag1' ],
										},
									},
								],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( editedPost ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				terms: {
					post_tag: [ 'tag1' ],
					category: {
						category3: { ID: 3 },
						category4: { ID: 4 },
					},
				},
			} );
		} );

		test( 'should memoize the merged post if there are no changes from previous call', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				status: 'draft',
				title: 'Hello',
			};

			const state = {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
					},
					queries: {
						2916284: new PostQueryManager( {
							items: {
								841: postObject,
							},
						} ),
					},
					edits: {
						2916284: {
							841: [ { title: 'Hello World' } ],
						},
					},
				},
			};

			const editedPost1 = getEditedPost( state, 2916284, 841 );
			const editedPost2 = getEditedPost( state, 2916284, 841 );

			// check for exact (===) equality
			expect( editedPost1 ).to.equal( editedPost2 );
		} );

		test( 'should return updated post object if the original post changes', () => {
			// items key will not change
			const items = {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			};

			// edits key will not change
			const edits = {
				2916284: {
					841: [ { title: 'Hello World' } ],
				},
			};

			// queries are different for each state
			const queries1 = {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							status: 'draft',
							title: 'Hello',
						},
					},
				} ),
			};

			const queries2 = {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							status: 'trash',
							title: 'Hello',
						},
					},
				} ),
			};

			const state1 = {
				posts: {
					items,
					queries: queries1,
					edits,
				},
			};

			const state2 = {
				posts: {
					items,
					queries: queries2,
					edits,
				},
			};

			const editedPost1 = getEditedPost( state1, 2916284, 841 );
			const editedPost2 = getEditedPost( state2, 2916284, 841 );

			// check that the values are different
			expect( editedPost1 ).to.not.equal( editedPost2 );
			expect( editedPost1.status ).to.equal( 'draft' );
			expect( editedPost2.status ).to.equal( 'trash' );
		} );

		test( 'should return updated post object if the post edits change', () => {
			// items key will not change
			const items = {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			};

			// queries key will not change
			const queries = {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							status: 'draft',
							title: 'Hello',
						},
					},
				} ),
			};

			// edits are different for each state
			const edits1 = {
				2916284: {
					841: [ { title: 'Hello World' } ],
				},
			};

			const edits2 = {
				2916284: {
					841: [ { title: 'Hello World!' } ],
				},
			};

			const state1 = {
				posts: {
					items,
					queries,
					edits: edits1,
				},
			};

			const state2 = {
				posts: {
					items,
					queries,
					edits: edits2,
				},
			};

			const editedPost1 = getEditedPost( state1, 2916284, 841 );
			const editedPost2 = getEditedPost( state2, 2916284, 841 );

			// check that the values are different
			expect( editedPost1 ).to.not.equal( editedPost2 );
			expect( editedPost1.title ).to.equal( 'Hello World' );
			expect( editedPost2.title ).to.equal( 'Hello World!' );
		} );
	} );

	describe( 'getPostEdits()', () => {
		test( 'should return null if no edits exist for a new post', () => {
			const postEdits = getPostEdits(
				{
					posts: {
						items: {},
						queries: {},
						edits: {},
					},
				},
				2916284
			);

			expect( postEdits ).to.be.null;
		} );

		test( 'should return null if no edits exist for an existing post', () => {
			const postEdits = getPostEdits(
				{
					posts: {
						items: {},
						queries: {},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( postEdits ).to.be.null;
		} );

		test( 'should return the edited attributes for a new post', () => {
			const postEdits = getPostEdits(
				{
					posts: {
						items: {},
						queries: {},
						edits: {
							2916284: {
								'': [ { title: 'Hello World!' } ],
							},
						},
					},
				},
				2916284
			);

			expect( postEdits ).to.eql( {
				title: 'Hello World!',
			} );
		} );

		test( 'should return the edited attributes for an existing post', () => {
			const postEdits = getPostEdits(
				{
					posts: {
						items: {},
						queries: {},
						edits: {
							2916284: {
								841: [ { title: 'Hello World!' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( postEdits ).to.eql( {
				title: 'Hello World!',
			} );
		} );
	} );

	describe( 'getEditedPostValue()', () => {
		test( 'should return undefined if the post does not exist', () => {
			const editedPostValue = getEditedPostValue(
				{
					posts: {
						items: {},
						queries: {},
						edits: {},
					},
				},
				2916284,
				841,
				'title'
			);

			expect( editedPostValue ).to.be.undefined;
		} );

		test( 'should return the assigned post value', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			};
			const editedPostValue = getEditedPostValue(
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
						edits: {
							2916284: {
								841: [ { title: 'Hello World!' } ],
							},
						},
					},
				},
				2916284,
				841,
				'title'
			);

			expect( editedPostValue ).to.equal( 'Hello World!' );
		} );

		test( 'should return the assigned nested post value', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				discussion: {
					comments_open: true,
				},
			};
			const editedPostValue = getEditedPostValue(
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
						edits: {
							2916284: {
								841: [
									{
										discussion: {
											pings_open: true,
										},
									},
								],
							},
						},
					},
				},
				2916284,
				841,
				'discussion.pings_open'
			);

			expect( editedPostValue ).to.be.true;
		} );
	} );

	describe( 'isEditedPostPasswordProtected()', () => {
		test( 'should return false if the post does not exist', () => {
			const protectedPost = isEditedPostPasswordProtected(
				{
					posts: {
						items: {},
						queries: {},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( protectedPost ).to.be.false;
		} );

		test( 'should return false if post password is a zero length string', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				password: 'secret',
			};
			const protectedPost = isEditedPostPasswordProtected(
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
						edits: {
							2916284: {
								841: [ { password: '' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( protectedPost ).to.be.false;
		} );

		test( 'should return true if post password is a non-zero length string', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				password: '',
			};
			const protectedPost = isEditedPostPasswordProtected(
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
						edits: {
							2916284: {
								841: [ { password: 'secret' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( protectedPost ).to.be.true;
		} );

		test( 'should return true if post password is whitespace only', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				password: '',
			};
			const protectedPost = isEditedPostPasswordProtected(
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
						edits: {
							2916284: {
								841: [ { password: ' ' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( protectedPost ).to.be.true;
		} );
	} );

	describe( 'isEditedPostPasswordProtectedWithValidPassword()', () => {
		test( 'should return false if the post does not exist', () => {
			const isPasswordValid = isEditedPostPasswordProtectedWithValidPassword(
				{
					posts: {
						items: {},
						queries: {},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( isPasswordValid ).to.be.false;
		} );

		test( 'should return false if post password is a zero length string', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				password: 'secret',
			};
			const isPasswordValid = isEditedPostPasswordProtectedWithValidPassword(
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
						edits: {
							2916284: {
								841: [ { password: '' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( isPasswordValid ).to.be.false;
		} );

		test( 'should return true if post password is a non-zero length string', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				password: '',
			};
			const isPasswordValid = isEditedPostPasswordProtectedWithValidPassword(
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
						edits: {
							2916284: {
								841: [ { password: 'secret' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( isPasswordValid ).to.be.true;
		} );

		test( 'should return false if post password is whitespace only', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				password: '',
			};
			const isPasswordValid = isEditedPostPasswordProtectedWithValidPassword(
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
						edits: {
							2916284: {
								841: [ { password: ' ' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( isPasswordValid ).to.be.false;
		} );
	} );

	describe( 'isEditedPostDirty()', () => {
		beforeEach( () => {
			isEditedPostDirty.memoizedSelector.cache.clear();
		} );

		test( 'should return false if there are no edits for the post', () => {
			const isDirty = isEditedPostDirty(
				{
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
						edits: {},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return false if edited with a type', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										type: 'post',
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { type: 'post' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return false if newly edited with custom type', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {},
						edits: {
							2916284: {
								'': [ { type: 'jetpack-portfolio' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return false if no saved post and value matches default for new post', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {},
						edits: {
							2916284: {
								'': [ { status: 'draft' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return true if no saved post and value does not match default for new post', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {},
						edits: {
							2916284: {
								'': [ { status: 'publish' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284
			);

			expect( isDirty ).to.be.true;
		} );

		test( 'should return true if no saved post and no default exists for key', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {},
						edits: {
							2916284: {
								'': [ { author: 'testonesite2014' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284
			);

			expect( isDirty ).to.be.true;
		} );

		test( 'should return false if saved post value equals edited post value', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { title: 'Hello World' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return true if edited post is unchanged but the raw content is different', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										content: 'Hello World',
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { content: 'Hello World' } ],
							},
						},
					},
					editor: {
						rawContent: {
							initial: 'Hello World',
							current: 'Hello World!',
						},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.true;
		} );

		test( 'should return true if saved post value does not equal edited post value', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World',
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { title: 'Hello World!' } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.true;
		} );

		test( 'should return true if saved post parent attr changes', () => {
			const isDirty = isEditedPostDirty(
				{
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
						edits: {
							2916284: {
								841: [ { parent: 10 } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.true;
		} );

		test( "should return false if saved post parent attr doesn't change", () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										parent: {
											ID: 10,
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { parent: 10 } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return true if saved post date changes', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										date: moment( '2016-09-14T15:47:33-04:00' ),
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { date: moment( '2017-09-14T15:47:33-04:00' ) } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.true;
		} );

		test( "should return false if saved post date doesn't change", () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										date: moment( '2016-09-14T15:47:33-04:00' ),
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { date: moment( '2016-09-14T15:47:33-04:00' ) } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return true if discussion options change', () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										discussion: {
											comment_status: 'open',
											comments_open: true,
											ping_status: 'open',
											pings_open: true,
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [
									{
										discussion: {
											comment_status: 'closed',
											ping_status: 'open',
										},
									},
								],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.true;
		} );

		test( "should return false if discussion options didn't change", () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										discussion: {
											comment_status: 'open',
											comments_open: true,
											ping_status: 'open',
											pings_open: true,
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [
									{
										discussion: {
											comment_status: 'open',
											ping_status: 'open',
										},
									},
								],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( "should return false if author ID didn't change", () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										author: {
											ID: 123,
											name: 'Robert Trujillo',
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [
									{
										author: {
											ID: 123,
											name: 'Bob Trujillo',
										},
									},
								],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( "should return false if featured image ID didn't change", () => {
			const isDirty = isEditedPostDirty(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										featured_image: 'https://example.files.wordpress.com/2018/02/img_4879.jpg',
										post_thumbnail: {
											ID: 123,
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { featured_image: 123 } ],
							},
						},
					},
					editor: {
						rawContent: {},
					},
				},
				2916284,
				841
			);

			expect( isDirty ).to.be.false;
		} );

		test( 'should return true if there are unapplied metadata edits', () => {
			const queries = {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							site_ID: 2916284,
							metadata: [ { key: 'seo_description', value: 'Hello' } ],
						},
					},
				} ),
			};

			// check unapplied metadata update
			const updateEdits = {
				2916284: {
					841: [
						{
							metadata: [
								{
									key: 'seo_description',
									value: 'Hello World',
									operation: 'update',
								},
							],
						},
					],
				},
			};

			expect(
				isEditedPostDirty(
					{
						posts: {
							queries,
							edits: updateEdits,
						},
						editor: {
							rawContent: {},
						},
					},
					2916284,
					841
				)
			).to.be.true;

			// check unapplied metadata delete
			const deleteEdits = {
				2916284: {
					841: [ { metadata: [ { key: 'seo_description', operation: 'delete' } ] } ],
				},
			};

			expect(
				isEditedPostDirty(
					{
						posts: {
							queries,
							edits: deleteEdits,
						},
						editor: {
							rawContent: {},
						},
					},
					2916284,
					841
				)
			).to.be.true;
		} );

		test( 'should return false if all metadata edits are already applied', () => {
			expect(
				isEditedPostDirty(
					{
						posts: {
							queries: {
								2916284: new PostQueryManager( {
									items: {
										841: {
											ID: 841,
											site_ID: 2916284,
											metadata: [ { key: 'seo_description', value: 'Hello World' } ],
										},
									},
								} ),
							},
							edits: {
								2916284: {
									841: [
										{
											metadata: [
												{
													key: 'seo_description',
													value: 'Hello World',
													operation: 'update',
												},
												{ key: 'geo_latitude', operation: 'delete' },
											],
										},
									],
								},
							},
						},
						editor: {
							rawContent: {},
						},
					},
					2916284,
					841
				)
			).to.be.false;
		} );

		test( 'should start returning false after update to original post makes the edits noop', () => {
			// items key will not change
			const items = {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			};

			// edits key will not change
			const edits = {
				2916284: {
					841: [ { title: 'Hello World' } ],
				},
			};

			// queries are different for each state
			const queries1 = {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello',
						},
					},
				} ),
			};

			const queries2 = {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
						},
					},
				} ),
			};

			const state1 = {
				posts: {
					items,
					queries: queries1,
					edits,
				},
				editor: {
					rawContent: {},
				},
			};

			const state2 = {
				posts: {
					items,
					queries: queries2,
					edits,
				},
				editor: {
					rawContent: {},
				},
			};

			// there are edits that change the post
			expect( isEditedPostDirty( state1, 2916284, 841 ) ).to.be.true;
			// the edits became noops and memoization cache was cleared
			expect( isEditedPostDirty( state2, 2916284, 841 ) ).to.be.false;
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

			expect( previewUrl ).to.be.null;
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

			expect( previewUrl ).to.be.null;
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

			expect( previewUrl ).to.be.null;
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

			expect( previewUrl ).to.equal( 'https://example.com/preview-url' );
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

			expect( previewUrl ).to.equal( 'https://example.com/post-url' );
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

			expect( previewUrl ).to.equal( 'https://example.wordpress.com/post-url' );
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

			expect( previewUrl ).to.equal( 'https://example.com/post-url?other_arg=1&preview=true' );
		} );
	} );

	describe( 'isPostPublished()', () => {
		test( 'should return null if the post is not known', () => {
			const isPublished = isPostPublished(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				841
			);

			expect( isPublished ).to.be.null;
		} );

		test( 'should return true if the post status is publish', () => {
			const isPublished = isPostPublished(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
									},
								},
							} ),
						},
					},
				},
				2916284,
				841
			);

			expect( isPublished ).to.be.true;
		} );

		test( 'should return true if the post status is private', () => {
			const isPublished = isPostPublished(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'private',
									},
								},
							} ),
						},
					},
				},
				2916284,
				841
			);

			expect( isPublished ).to.be.true;
		} );

		test( 'should return false if the post status is draft', () => {
			const isPublished = isPostPublished(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'draft',
									},
								},
							} ),
						},
					},
				},
				2916284,
				841
			);

			expect( isPublished ).to.be.false;
		} );

		test( 'should return false if the post status is future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() + tenMinutes;
			const isPublished = isPostPublished(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'future',
										date: postDate,
									},
								},
							} ),
						},
					},
				},
				2916284,
				841
			);

			expect( isPublished ).to.be.false;
		} );

		test( 'should return true if the post status is future and date is in past', () => {
			const tenMinutes = 1000 * 60;
			const postDate = Date.now() - tenMinutes;
			const isPublished = isPostPublished(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'future',
										date: postDate,
									},
								},
							} ),
						},
					},
				},
				2916284,
				841
			);

			expect( isPublished ).to.be.true;
		} );
	} );

	describe( 'getEditedPostSlug()', () => {
		test( 'should return undefined if the post is not known', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.be.undefined;
		} );

		test( 'should return post.slug if post is published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										slug: 'chewbacca',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( 'chewbacca' );
		} );

		test( 'should return decoded non-latin post.slug if post is published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										slug: '%D7%96%D7%94%D7%95%20%D7%A2%D7%99%D7%9F%20%D7%94%D7%A0%D7%9E%D7%A8',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( 'זהו עין הנמר' );
		} );

		test( 'should return undecoded post.slug if post with malformed URI sequence is published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										slug: 'most-of-this-slug-is-fine-%F0%9F%99%88%-but-the-following-is-not-%e42',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql(
				'most-of-this-slug-is-fine-%F0%9F%99%88%-but-the-following-is-not-%e42'
			);
		} );

		test( 'should return decoded post.slug with emoji sequences if post is published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'publish',
										slug: '%F0%9F%99%88%F0%9F%99%8A%F0%9F%99%89',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( '🙈🙊🙉' );
		} );

		test( 'should return edited slug if post is not published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'draft',
										slug: 'chewbacca',
										other_URLs: {
											suggested_slug: 'chewbacca',
										},
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { slug: 'jedi' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( 'jedi' );
		} );

		test( 'should return suggested-slug if post is not published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'draft',
										other_URLs: {
											suggested_slug: 'chewbacca',
										},
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( 'chewbacca' );
		} );

		test( 'should return slug if post is not published and slug is set', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'draft',
										other_URLs: {
											suggested_slug: 'chewbacca',
										},
										slug: 'jedi',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( 'jedi' );
		} );

		test( 'should return edited slug if post is published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'private',
										other_URLs: {
											suggested_slug: 'chewbacca',
										},
										slug: 'jedi',
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { slug: 'ewok' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( 'ewok' );
		} );

		test( 'should return an empty edited slug if post is published', () => {
			const slug = getEditedPostSlug(
				{
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										status: 'private',
										other_URLs: {
											suggested_slug: 'chewbacca',
										},
										slug: 'jedi',
									},
								},
							} ),
						},
						edits: {
							2916284: {
								841: [ { slug: '' } ],
							},
						},
					},
				},
				2916284,
				841
			);

			expect( slug ).to.eql( '' );
		} );
	} );

	describe( 'getSitePostsByTerm()', () => {
		test( 'should return an array of post objects for the site matching the termId', () => {
			const postObjects = {
				2916284: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						terms: {
							category: [ { ID: 10 } ],
						},
					},
					'6c831c187ffef321eb43a67761a525a3': {
						ID: 413,
						site_ID: 2916284,
						global_ID: '6c831c187ffef321eb43a67761a525a3',
						title: 'Ribs &amp; Chicken',
					},
				},
			};
			const state = {
				posts: {
					queries: {
						2916284: new PostQueryManager( {
							items: postObjects[ 2916284 ],
						} ),
					},
				},
			};

			expect( getSitePostsByTerm( state, 2916284, 'category', 10 ) ).to.have.members( [
				postObjects[ 2916284 ][ '3d097cb7c5473c169bba0eb8e3c6cb64' ],
			] );
		} );
	} );
} );
