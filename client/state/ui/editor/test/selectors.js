/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getEditorPostId,
	isEditorNewPost,
	getEditorNewPostPath,
	getEditorPath,
	isEditorOnlyRouteInHistory,
} from '../selectors';
import PostQueryManager from 'lib/query-manager/post';

describe( 'selectors', () => {
	describe( '#getEditorPostId()', () => {
		test( 'should return the current editor post ID', () => {
			const postId = getEditorPostId( {
				ui: {
					editor: {
						postId: 183,
					},
				},
			} );

			expect( postId ).to.equal( 183 );
		} );
	} );

	describe( '#isEditorNewPost()', () => {
		test( 'should return false if a post ID is currently set', () => {
			const isNew = isEditorNewPost( {
				ui: {
					editor: {
						postId: 183,
					},
				},
			} );

			expect( isNew ).to.be.false;
		} );

		test( 'should return true if no post ID is currently set', () => {
			const isNew = isEditorNewPost( {
				ui: {
					editor: {
						postId: null,
					},
				},
			} );

			expect( isNew ).to.be.true;
		} );
	} );

	describe( 'getEditorNewPostPath()', () => {
		test( 'should return the post path with the site ID if site unknown', () => {
			const path = getEditorNewPostPath(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			expect( path ).to.equal( '/post/2916284' );
		} );

		test( 'should prefix the post route for post types', () => {
			const path = getEditorNewPostPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( path ).to.equal( '/post/example.wordpress.com' );
		} );

		test( 'should prefix the page route for page types', () => {
			const path = getEditorNewPostPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
				},
				2916284,
				'page'
			);

			expect( path ).to.equal( '/page/example.wordpress.com' );
		} );

		test( 'should prefix the type route for custom post types', () => {
			const path = getEditorNewPostPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
				},
				2916284,
				'jetpack-portfolio'
			);

			expect( path ).to.equal( '/edit/jetpack-portfolio/example.wordpress.com' );
		} );
	} );

	describe( '#getEditorPath()', () => {
		test( 'should return the post path with the post ID if post unknown', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
					posts: {
						queries: {},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( path ).to.equal( '/post/example.wordpress.com/841' );
		} );

		test( 'should return the post path with the site ID if site unknown', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {},
					},
					posts: {
						queries: {},
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( path ).to.equal( '/post/2916284/841' );
		} );

		test( 'should prefix the post route for post types', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
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
						edits: {},
					},
				},
				2916284,
				841
			);

			expect( path ).to.equal( '/post/example.wordpress.com/841' );
		} );

		test( 'should prefix the page route for page types', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									413: {
										ID: 413,
										site_ID: 2916284,
										global_ID: '6c831c187ffef321eb43a67761a525a3',
										type: 'page',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				413
			);

			expect( path ).to.equal( '/page/example.wordpress.com/413' );
		} );

		test( 'should prefix the type route for custom post types', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									120: {
										ID: 120,
										site_ID: 2916284,
										global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
										type: 'jetpack-portfolio',
									},
								},
							} ),
						},
						edits: {},
					},
				},
				2916284,
				120
			);

			expect( path ).to.equal( '/edit/jetpack-portfolio/example.wordpress.com/120' );
		} );

		test( 'should derive post type from edited post', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
					posts: {
						queries: {},
						edits: {
							2916284: {
								'': {
									type: 'jetpack-portfolio',
								},
							},
						},
					},
				},
				2916284
			);

			expect( path ).to.equal( '/edit/jetpack-portfolio/example.wordpress.com' );
		} );

		test( 'should allow overriding the fallback post type for unknown post', () => {
			const path = getEditorPath(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com',
							},
						},
					},
					posts: {
						queries: {},
						edits: {},
					},
				},
				2916284,
				null,
				'jetpack-portfolio'
			);

			expect( path ).to.equal( '/edit/jetpack-portfolio/example.wordpress.com' );
		} );
	} );

	describe( 'isEditorOnlyRouteInHistory()', () => {
		test( 'should return true when Editor is the only route in history', () => {
			const isOnlyRoute = isEditorOnlyRouteInHistory( {
				ui: {
					actionLog: [
						{
							type: 'ROUTE_SET',
							path: '/post/example.com/123',
						},
					],
				},
			} );

			expect( isOnlyRoute ).to.be.true;
		} );

		test( 'should return false when Editor is not the only route in history', () => {
			const isOnlyRoute = isEditorOnlyRouteInHistory( {
				ui: {
					actionLog: [
						{
							type: 'ROUTE_SET',
							path: '/',
						},
						{
							type: 'ROUTE_SET',
							path: '/post/example.com/123',
						},
					],
				},
			} );

			expect( isOnlyRoute ).to.be.false;
		} );
	} );
} );
