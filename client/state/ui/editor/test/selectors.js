/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	getEditorPostId,
	isEditorNewPost,
	getEditorNewPostPath,
	getEditorPath,
	getEditorPublishButtonStatus,
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
								'': [ { type: 'jetpack-portfolio' } ],
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

	describe( '#getEditorPublishButtonStatus()', () => {
		const siteId = 123;
		const postId = 456;

		const editorState = ( post, edits = null, canUserPublishPosts = true ) => ( {
			posts: {
				queries: {
					[ siteId ]: new PostQueryManager( {
						items: {
							[ postId ]: post,
						},
					} ),
				},
				edits: {
					[ siteId ]: {
						[ postId ]: edits,
					},
				},
			},
			ui: {
				selectedSiteId: siteId,
				editor: { postId },
			},
			currentUser: {
				capabilities: {
					[ siteId ]: {
						publish_posts: canUserPublishPosts,
					},
				},
			},
		} );

		test( 'should return "update" if the post was originally published and is still slated to be published', () => {
			const state = editorState( { status: 'publish' }, null );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'update' );
		} );

		test( 'should return "update" if the post was originally published and is currently reverted to non-published status', () => {
			const state = editorState( { status: 'publish' }, [ { status: 'draft' } ] );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'update' );
		} );

		test( 'should return "schedule" if the post is dated in the future and not scheduled', () => {
			const date = moment().add( 1, 'month' ).format();
			const state = editorState( { status: 'draft' }, [ { date } ] );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'schedule' );
		} );

		test( 'should return "schedule" if the post is dated in the future and published', () => {
			const date = moment().add( 1, 'month' ).format();
			const state = editorState( { status: 'publish' }, [ { date } ] );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'schedule' );
		} );

		test( 'should return "update" if the post is scheduled and dated in the future', () => {
			const date = moment().add( 1, 'month' ).format();
			const state = editorState( { status: 'future', date }, [ { title: 'change' } ] );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'update' );
		} );

		test( 'should return "update" if the post is scheduled, dated in the future, and next status is draft', () => {
			const date = moment().add( 1, 'month' ).format();
			const state = editorState( { status: 'future', date }, [
				{ title: 'change', status: 'draft' },
			] );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'update' );
		} );

		test( 'should return "publish" if the post is scheduled and dated in the past', () => {
			const date = moment().subtract( 1, 'month' ).format();
			const state = editorState( { status: 'future', date }, [ { title: 'change' } ] );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'publish' );
		} );

		test( 'should return "publish" if the post is a draft', () => {
			const state = editorState( { status: 'draft' } );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'publish' );
		} );

		test( 'should return "requestReview" if the post is a draft and user can\'t publish', () => {
			const state = editorState( { status: 'draft' }, null, false );
			expect( getEditorPublishButtonStatus( state ) ).to.equal( 'requestReview' );
		} );

		test( 'should return null if no site is selected', () => {
			const state = {
				posts: { queries: {}, edits: {} },
				ui: {
					selectedSiteId: null,
					editor: { postId: null },
				},
				currentUser: { capabilities: {} },
			};
			expect( getEditorPublishButtonStatus( state ) ).to.be.null;
		} );

		test( 'should return null if site and post selected, but post not yet loaded', () => {
			const state = {
				posts: { queries: {}, edits: {} },
				ui: {
					selectedSiteId: siteId,
					editor: { postId },
				},
				currentUser: { capabilities: {} },
			};
			expect( getEditorPublishButtonStatus( state ) ).to.be.null;
		} );
	} );
} );
