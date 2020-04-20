/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, {
	items,
	queryRequests,
	queries,
	allSitesQueries,
	siteRequests,
	edits,
} from '../reducer';
import PostQueryManager from 'lib/query-manager/post';
import {
	EDITOR_START,
	EDITOR_STOP,
	POST_DELETE,
	POST_DELETE_SUCCESS,
	POST_DELETE_FAILURE,
	POST_EDIT,
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_RESTORE,
	POST_RESTORE_FAILURE,
	POST_SAVE,
	POST_SAVE_SUCCESS,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_FAILURE,
	POSTS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'counts',
			'items',
			'siteRequests',
			'queryRequests',
			'queries',
			'allSitesQueries',
			'edits',
			'likes',
			'revisions',
		] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index received posts by global ID', () => {
			const state = items( undefined, {
				type: POSTS_RECEIVE,
				posts: [
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
				],
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
				'6c831c187ffef321eb43a67761a525a3': [ 2916284, 413 ],
			} );
		} );

		test( 'should accumulate posts', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			} );
			const state = items( original, {
				type: POSTS_RECEIVE,
				posts: [
					{
						ID: 413,
						site_ID: 2916284,
						global_ID: '6c831c187ffef321eb43a67761a525a3',
						title: 'Ribs & Chicken',
					},
				],
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
				'6c831c187ffef321eb43a67761a525a3': [ 2916284, 413 ],
			} );
		} );

		test( 'should remove an item when delete action is dispatched', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			} );
			const state = items( original, {
				type: POST_DELETE_SUCCESS,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ],
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#queryRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track post query request fetching', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' },
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': true,
			} );
		} );

		test( 'should track post queries without specified site', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: POSTS_REQUEST,
				query: { search: 'Hello' },
			} );

			expect( state ).to.eql( {
				'{"search":"Hello"}': true,
			} );
		} );

		test( 'should accumulate queries', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true,
			} );

			const state = queryRequests( original, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello W' },
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': true,
				'2916284:{"search":"Hello W"}': true,
			} );
		} );

		test( 'should track post query request success', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
					},
				],
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': false,
			} );
		} );

		test( 'should track post query request failure', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: POSTS_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Hello' },
				error: new Error(),
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': false,
			} );
		} );
	} );

	describe( '#queries()', () => {
		test( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track post query request success', () => {
			const state = queries( deepFreeze( {} ), {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						meta: {
							links: {},
						},
					},
				],
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( PostQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Hello' } ) ).to.eql( [
				{
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
					meta: {},
				},
			] );
		} );

		test( 'should accumulate query request success', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'publish',
							type: 'post',
						},
					],
				} )
			);

			const state = queries( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello W' },
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						status: 'publish',
						type: 'post',
					},
				],
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( PostQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Hello' } ) ).to.have.length( 1 );
			expect( state[ 2916284 ].getItems( { search: 'Hello W' } ) ).to.have.length( 1 );
		} );

		test( 'should return the same state if successful request has no changes', () => {
			const action = {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						status: 'publish',
						type: 'post',
					},
				],
			};
			const original = deepFreeze( queries( deepFreeze( {} ), action ) );
			const state = queries( original, action );

			expect( state ).to.equal( original );
		} );

		test( 'should track posts even if not associated with an existing site or query', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			};
			const state = queries( deepFreeze( {} ), {
				type: POSTS_RECEIVE,
				posts: [ postObject ],
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( PostQueryManager );
			expect( state[ 2916284 ].getItems() ).to.eql( [ postObject ] );
		} );

		test( 'should update received posts', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'publish',
							type: 'post',
						},
					],
				} )
			);

			const state = queries( original, {
				type: POSTS_RECEIVE,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						status: 'draft',
						type: 'post',
					},
				],
			} );

			expect( state[ 2916284 ].getItem( 841 ) ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				status: 'draft',
				type: 'post',
			} );
		} );

		test( 'should apply pending restore status on restore actions', () => {
			let original = deepFreeze( {} );
			original = queries( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );

			const state = queries( original, {
				type: POST_RESTORE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state[ 2916284 ].getItem( 841 ).status ).to.equal( '__RESTORE_PENDING' );
			expect( state[ 2916284 ].getItems( { status: 'trash' } ) ).to.have.length( 0 );
		} );

		test( 'should apply pending trash status on restore failure actions', () => {
			let original = deepFreeze( {} );
			original = queries( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );

			original = queries( original, {
				type: POST_RESTORE,
				siteId: 2916284,
				postId: 841,
			} );

			const state = queries( original, {
				type: POST_RESTORE_FAILURE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state[ 2916284 ].getItem( 841 ).status ).to.equal( 'trash' );
			expect( state[ 2916284 ].getItems( { status: 'trash' } ) ).to.have.length( 1 );
		} );

		test( 'should apply save actions as partial received posts', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'draft',
							type: 'post',
						},
					],
				} )
			);

			const state = queries( original, {
				type: POST_SAVE,
				siteId: 2916284,
				postId: 841,
				post: {
					status: 'trash',
				},
			} );

			expect( state[ 2916284 ].getItem( 841 ) ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				status: 'trash',
				type: 'post',
			} );
		} );

		test( 'should apply pending delete status on delete actions', () => {
			let original = deepFreeze( {} );
			original = queries( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );

			const state = queries( original, {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state[ 2916284 ].getItem( 841 ).status ).to.equal( '__DELETE_PENDING' );
			expect( state[ 2916284 ].getItems( { status: 'trash' } ) ).to.have.length( 0 );
		} );

		test( 'should restore item when post delete fails', () => {
			let original = deepFreeze( {} );
			original = queries( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );
			original = queries( original, {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( original[ 2916284 ].getItems( { status: 'trash' } ) ).to.have.length( 0 );

			const state = queries( original, {
				type: POST_DELETE_FAILURE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state[ 2916284 ].getItem( 841 ).status ).to.equal( 'trash' );
			expect( state[ 2916284 ].getItems( { status: 'trash' } ) ).to.have.length( 1 );
		} );

		test( 'should remove item when post delete action success dispatched', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'trash',
							type: 'post',
						},
					],
				} )
			);

			const state = queries( original, {
				type: POST_DELETE_SUCCESS,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state[ 2916284 ].getItems() ).to.have.length( 0 );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze(
				queries( deepFreeze( {} ), {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
						},
					],
				} )
			);

			const state = queries( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					data: {
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
					},
					options: {
						itemKey: 'ID',
					},
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					data: {
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
					},
					options: {
						itemKey: 'ID',
					},
				},
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: new PostQueryManager( {
					items: {
						841: {
							ID: 841,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							site_ID: 2916284,
							title: 'Hello World',
						},
					},
					queries: {
						'[["search","Hello"]]': {
							found: 1,
							itemKeys: [ 841 ],
						},
					},
				} ),
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: '{INVALID',
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#siteRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = siteRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should map site ID, post ID to true value if request in progress', () => {
			const state = siteRequests( deepFreeze( {} ), {
				type: POST_REQUEST,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state ).to.eql( {
				2916284: {
					841: true,
				},
			} );
		} );

		test( 'should accumulate mappings', () => {
			const state = siteRequests(
				deepFreeze( {
					2916284: {
						841: true,
					},
				} ),
				{
					type: POST_REQUEST,
					siteId: 2916284,
					postId: 413,
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: true,
					413: true,
				},
			} );
		} );

		test( 'should map site ID, post ID to false value if request finishes successfully', () => {
			const state = siteRequests(
				deepFreeze( {
					2916284: {
						841: true,
					},
				} ),
				{
					type: POST_REQUEST_SUCCESS,
					siteId: 2916284,
					postId: 841,
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: false,
				},
			} );
		} );

		test( 'should map site ID, post ID to false value if request finishes with failure', () => {
			const state = siteRequests(
				deepFreeze( {
					2916284: {
						841: true,
					},
				} ),
				{
					type: POST_REQUEST_FAILURE,
					siteId: 2916284,
					postId: 841,
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: false,
				},
			} );
		} );
	} );

	describe( '#edits()', () => {
		test( 'should default to an empty object', () => {
			const state = edits( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track new post draft revisions by site ID', () => {
			const state = edits( deepFreeze( {} ), {
				type: POST_EDIT,
				siteId: 2916284,
				postId: null,
				post: { title: 'Ribs & Chicken' },
			} );

			expect( state ).to.eql( {
				2916284: {
					'': [ { title: 'Ribs & Chicken' } ],
				},
			} );
		} );

		test( 'should track existing post revisions by site ID, post ID', () => {
			const state = edits( deepFreeze( {} ), {
				type: POST_EDIT,
				siteId: 2916284,
				postId: 841,
				post: { title: 'Hello World' },
			} );

			expect( state ).to.eql( {
				2916284: {
					841: [ { title: 'Hello World' } ],
				},
			} );
		} );

		test( 'should accumulate posts', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						'': [ { title: 'Ribs & Chicken' } ],
					},
				} ),
				{
					type: POST_EDIT,
					siteId: 2916284,
					postId: 841,
					post: { title: 'Hello World' },
				}
			);

			expect( state ).to.eql( {
				2916284: {
					'': [ { title: 'Ribs & Chicken' } ],
					841: [ { title: 'Hello World' } ],
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						'': [ { title: 'Ribs & Chicken' } ],
					},
				} ),
				{
					type: POST_EDIT,
					siteId: 77203074,
					postId: 841,
					post: { title: 'Hello World' },
				}
			);

			expect( state ).to.eql( {
				2916284: {
					'': [ { title: 'Ribs & Chicken' } ],
				},
				77203074: {
					841: [ { title: 'Hello World' } ],
				},
			} );
		} );

		test( 'should merge post revisions', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						'': [ { title: 'Ribs & Chicken' } ],
					},
				} ),
				{
					type: POST_EDIT,
					siteId: 2916284,
					post: { content: 'Delicious.' },
				}
			);

			expect( state ).to.eql( {
				2916284: {
					'': [
						{
							title: 'Ribs & Chicken',
							content: 'Delicious.',
						},
					],
				},
			} );
		} );

		test( 'should merge nested post revisions', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						'': [
							{
								title: 'Ribs & Chicken',
								discussion: {
									comments_open: false,
								},
							},
						],
					},
				} ),
				{
					type: POST_EDIT,
					siteId: 2916284,
					post: {
						discussion: {
							pings_open: false,
						},
					},
				}
			);

			expect( state ).to.eql( {
				2916284: {
					'': [
						{
							title: 'Ribs & Chicken',
							discussion: {
								comments_open: false,
								pings_open: false,
							},
						},
					],
				},
			} );
		} );

		test( 'should do nothing when received post has no active edits', () => {
			const state = {
				2916284: {
					841: [ { title: 'Unrelated' } ],
				},
			};

			const newState = edits( state, {
				type: POSTS_RECEIVE,
				posts: [ { ID: 842, site_ID: 2916284, type: 'post' } ],
			} );

			expect( newState ).to.equal( state );
		} );

		test( 'should eliminate redundant data on posts received', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [ { title: 'Hello World', type: 'post' } ],
						'': [ { title: 'Unrelated' } ],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [ { ID: 841, site_ID: 2916284, type: 'post' } ],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [ { title: 'Hello World' } ],
					'': [ { title: 'Unrelated' } ],
				},
			} );
		} );

		test( 'should handle term shape differences on posts received', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								title: 'Hello World',
								type: 'post',
								terms: {
									post_tag: [ 'chicken', 'ribs' ],
									category: [
										{
											ID: 1,
											name: 'uncategorized',
										},
									],
								},
							},
						],
						'': [ { title: 'Unrelated' } ],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							title: 'Hello',
							terms: {
								post_tag: {
									chicken: {
										ID: 111,
										name: 'chicken',
									},
									ribs: {
										ID: 112,
										name: 'ribs',
									},
								},
								category: {
									uncategorized: {
										ID: 1,
										name: 'uncategorized',
									},
								},
							},
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [ { title: 'Hello World' } ],
					'': [ { title: 'Unrelated' } ],
				},
			} );
		} );

		test( 'should preserve term edit differences on posts received', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								title: 'Hello World',
								type: 'post',
								terms: {
									post_tag: [ 'ribs' ],
									category: [
										{
											ID: 1,
											name: 'uncategorized',
										},
									],
								},
							},
						],
						'': [ { title: 'Unrelated' } ],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							title: 'Hello World',
							terms: {
								post_tag: {
									chicken: {
										ID: 111,
										name: 'chicken',
									},
								},
								category: {
									uncategorized: {
										ID: 1,
										name: 'uncategorized',
									},
								},
							},
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [
						{
							terms: {
								post_tag: [ 'ribs' ],
								category: [
									{
										ID: 1,
										name: 'uncategorized',
									},
								],
							},
						},
					],
					'': [ { title: 'Unrelated' } ],
				},
			} );
		} );

		test( 'should remove discussion edits after they are saved', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								title: 'Hello World',
								type: 'post',
								discussion: {
									comment_status: 'open',
									ping_status: 'open',
								},
							},
						],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							title: 'Hello',
							discussion: {
								comment_status: 'open',
								comments_open: true,
								ping_status: 'open',
								pings_open: true,
							},
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [ { title: 'Hello World' } ],
				},
			} );
		} );

		test( 'should keep discussion edits if they are not yet present in the saved post', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								title: 'Hello World',
								type: 'post',
								discussion: {
									comment_status: 'closed',
									ping_status: 'open',
								},
							},
						],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							title: 'Hello',
							discussion: {
								comment_status: 'open',
								comments_open: true,
								ping_status: 'open',
								pings_open: true,
							},
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [
						{
							title: 'Hello World',
							discussion: {
								comment_status: 'closed',
								ping_status: 'open',
							},
						},
					],
				},
			} );
		} );

		test( 'should remove author edit after it is saved and user IDs are equal', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								title: 'Hello World',
								type: 'post',
								author: {
									ID: 123,
									name: 'Robert Trujillo',
								},
							},
						],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							title: 'Hello',
							author: {
								ID: 123,
								name: 'Bob Trujillo',
							},
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [ { title: 'Hello World' } ],
				},
			} );
		} );

		test( 'should remove featured image edit after it is saved', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								featured_image: 123,
							},
						],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							featured_image: 'https://example.files.wordpress.com/2018/02/img_4879.jpg',
							post_thumbnail: {
								ID: 123,
							},
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: null,
				},
			} );
		} );

		test( 'should remove metadata edits after they are saved', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [
							{
								metadata: [
									{ key: 'tobeupdated', value: 'newvalue', operation: 'update' },
									{ key: 'tobedeleted', operation: 'delete' },
									{
										key: 'notyetupdated',
										value: 'newvalue',
										operation: 'update',
									},
									{ key: 'notyetdeleted', operation: 'delete' },
								],
							},
						],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							metadata: [
								{ key: 'tobeupdated', value: 'newvalue' },
								{ key: 'notyetupdated', value: 'oldvalue' },
								{ key: 'notyetdeleted', value: 'value' },
							],
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [
						{
							metadata: [
								{ key: 'notyetupdated', value: 'newvalue', operation: 'update' },
								{ key: 'notyetdeleted', operation: 'delete' },
							],
						},
					],
				},
			} );
		} );

		test( 'should remove date edits after they are saved', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: [ { date: '2018-05-01T10:36:41+02:00' } ],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							type: 'post',
							date: '2018-05-01T08:36:41+00:00',
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: null,
				},
			} );
		} );

		test( 'should consider date not edited after resetting draft date', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						842: [
							{
								title: 'I like turtles',
								date: false,
							},
						],
					},
				} ),
				{
					type: POSTS_RECEIVE,
					posts: [
						{
							ID: 842,
							site_ID: 2916284,
							title: 'I like turtles!',
							date: '2018-06-14T16:47:21+00:00',
						},
					],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					842: [ { title: 'I like turtles' } ],
				},
			} );
		} );

		test( 'should remove status edits after they are saved', () => {
			const emptyEditsState = {
				2916284: {
					841: null,
				},
			};

			const editsStateWithStatus = ( status ) =>
				deepFreeze( {
					2916284: {
						841: [ { status } ],
					},
				} );

			const receivePostActionWithStatus = ( status ) => ( {
				type: POSTS_RECEIVE,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						type: 'post',
						status,
					},
				],
			} );

			expect(
				edits( editsStateWithStatus( 'publish' ), receivePostActionWithStatus( 'future' ) )
			).to.eql( emptyEditsState );
			expect(
				edits( editsStateWithStatus( 'publish' ), receivePostActionWithStatus( 'publish' ) )
			).to.eql( emptyEditsState );
			expect(
				edits( editsStateWithStatus( 'future' ), receivePostActionWithStatus( 'publish' ) )
			).to.eql( emptyEditsState );
			expect(
				edits( editsStateWithStatus( 'draft' ), receivePostActionWithStatus( 'draft' ) )
			).to.eql( emptyEditsState );
		} );

		test( "should ignore reset edits action when discarded site doesn't exist", () => {
			const original = deepFreeze( {} );
			const state = edits( original, {
				type: POST_SAVE_SUCCESS,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should copy edits when the post is saved and prior postId was null', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						'': [ { title: 'Ribs & Chicken' } ],
						842: [ { title: 'I like turtles' } ],
					},
				} ),
				{
					type: POST_SAVE_SUCCESS,
					siteId: 2916284,
					postId: null,
					savedPost: {
						ID: 841,
						title: 'Ribs',
					},
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: [ { title: 'Ribs & Chicken' } ],
					842: [ { title: 'I like turtles' } ],
				},
			} );
		} );

		test( "should ignore stop editor action when site doesn't exist", () => {
			const original = deepFreeze( {} );
			const state = edits( original, {
				type: EDITOR_STOP,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should discard edits when we stop editing the post', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: {
							title: 'Hello World',
						},
						'': {
							title: 'Ribs & Chicken',
						},
					},
				} ),
				{
					type: EDITOR_STOP,
					siteId: 2916284,
					postId: 841,
				}
			);

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken',
					},
				},
			} );
		} );

		test( 'should reset edits when we start editing a post', () => {
			const state = edits(
				deepFreeze( {
					2916284: {
						841: {
							title: 'Hello World',
						},
						'': {
							title: 'Ribs & Chicken',
						},
					},
				} ),
				{
					type: EDITOR_START,
					siteId: 2916284,
					postId: 841,
					postType: 'jetpack-testimonial',
				}
			);

			expect( state ).to.eql( {
				2916284: {
					841: null,
					'': {
						title: 'Ribs & Chicken',
					},
				},
			} );
		} );
	} );

	describe( '#allSitesQueries()', () => {
		test( 'should default to a new PostQueryManager', () => {
			const state = allSitesQueries( undefined, {} );

			expect( state ).to.be.an.instanceof( PostQueryManager );
			expect( state.data ).to.eql( { items: {}, queries: {} } );
			expect( state.options ).to.eql( { itemKey: 'global_ID' } );
		} );

		test( 'should track post query request success', () => {
			const state = allSitesQueries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: null,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						meta: {
							links: {},
						},
					},
				],
			} );

			expect( state.getItems( { search: 'Hello' } ) ).to.eql( [
				{
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
					meta: {},
				},
			] );
		} );

		test( 'should accumulate query request success', () => {
			const original = deepFreeze(
				allSitesQueries( undefined, {
					type: POSTS_REQUEST_SUCCESS,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'publish',
							type: 'post',
						},
					],
				} )
			);

			const state = allSitesQueries( original, {
				type: POSTS_REQUEST_SUCCESS,
				query: { search: 'Hello W' },
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						status: 'publish',
						type: 'post',
					},
				],
			} );

			expect( state.data.items ).to.have.keys( [ '3d097cb7c5473c169bba0eb8e3c6cb64' ] );
			expect( state.getItems( { search: 'Hello' } ) ).to.have.length( 1 );
			expect( state.getItems( { search: 'Hello W' } ) ).to.have.length( 1 );
		} );

		test( 'should return the same state if successful request has no changes', () => {
			const action = {
				type: POSTS_REQUEST_SUCCESS,
				siteId: null,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						status: 'publish',
						type: 'post',
					},
				],
			};
			const original = deepFreeze( allSitesQueries( undefined, action ) );
			const state = allSitesQueries( original, action );

			expect( state ).to.equal( original );
		} );

		test( 'should track post items received from site-specific queries', () => {
			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			};
			const state = allSitesQueries( undefined, {
				type: POSTS_RECEIVE,
				posts: [ postObject ],
			} );

			expect( state.data.items ).to.have.keys( [ '3d097cb7c5473c169bba0eb8e3c6cb64' ] );
		} );

		test( 'should ignore query results of site-specific queries', () => {
			const state = allSitesQueries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
					},
				],
			} );

			expect( state.data ).to.eql( { items: {}, queries: {} } );
		} );

		test( 'should update received posts', () => {
			const original = deepFreeze(
				allSitesQueries( undefined, {
					type: POSTS_REQUEST_SUCCESS,
					siteId: null,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'publish',
							type: 'post',
						},
					],
				} )
			);

			const state = allSitesQueries( original, {
				type: POSTS_RECEIVE,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World',
						status: 'draft',
						type: 'post',
					},
				],
			} );

			expect( state.getItem( '3d097cb7c5473c169bba0eb8e3c6cb64' ) ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				status: 'draft',
				type: 'post',
			} );
		} );

		test( 'should apply pending restore status on restore actions', () => {
			const original = allSitesQueries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: null,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );

			const state = allSitesQueries( original, {
				type: POST_RESTORE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state.getItem( '48b6010b559efe6a77a429773e0cbf12' ).status ).to.equal(
				'__RESTORE_PENDING'
			);
			expect( state.getItems( { status: 'trash' } ) ).to.have.length( 0 );
		} );

		test( 'should apply pending trash status on restore failure actions', () => {
			let original = allSitesQueries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: null,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );

			original = allSitesQueries( original, {
				type: POST_RESTORE,
				siteId: 2916284,
				postId: 841,
			} );

			const state = allSitesQueries( original, {
				type: POST_RESTORE_FAILURE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state.getItem( '48b6010b559efe6a77a429773e0cbf12' ).status ).to.equal( 'trash' );
			expect( state.getItems( { status: 'trash' } ) ).to.have.length( 1 );
		} );

		test( 'should apply save actions as partial received posts', () => {
			const original = deepFreeze(
				allSitesQueries( undefined, {
					type: POSTS_REQUEST_SUCCESS,
					siteId: null,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'draft',
							type: 'post',
						},
					],
				} )
			);

			const state = allSitesQueries( original, {
				type: POST_SAVE,
				siteId: 2916284,
				postId: 841,
				post: {
					status: 'trash',
				},
			} );

			expect( state.getItem( '3d097cb7c5473c169bba0eb8e3c6cb64' ) ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
				status: 'trash',
				type: 'post',
			} );
		} );

		test( 'should apply pending delete status on delete actions', () => {
			const original = allSitesQueries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: null,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );

			const state = allSitesQueries( original, {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state.getItem( '48b6010b559efe6a77a429773e0cbf12' ).status ).to.equal(
				'__DELETE_PENDING'
			);
			expect( state.getItems( { status: 'trash' } ) ).to.have.length( 0 );
		} );

		test( 'should restore item when post delete fails', () => {
			let original = allSitesQueries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: null,
				query: { status: 'trash' },
				found: 1,
				posts: [
					{
						ID: 841,
						site_ID: 2916284,
						global_ID: '48b6010b559efe6a77a429773e0cbf12',
						title: 'Trashed',
						status: 'trash',
						type: 'post',
					},
				],
			} );
			original = allSitesQueries( original, {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( original.getItems( { status: 'trash' } ) ).to.have.length( 0 );

			const state = allSitesQueries( original, {
				type: POST_DELETE_FAILURE,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state.getItem( '48b6010b559efe6a77a429773e0cbf12' ).status ).to.equal( 'trash' );
			expect( state.getItems( { status: 'trash' } ) ).to.have.length( 1 );
		} );

		test( 'should remove item when post delete action success dispatched', () => {
			const original = deepFreeze(
				allSitesQueries( undefined, {
					type: POSTS_REQUEST_SUCCESS,
					siteId: null,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
							status: 'trash',
							type: 'post',
						},
					],
				} )
			);

			const state = allSitesQueries( original, {
				type: POST_DELETE_SUCCESS,
				siteId: 2916284,
				postId: 841,
			} );

			expect( state.getItems() ).to.have.length( 0 );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze(
				allSitesQueries( undefined, {
					type: POSTS_REQUEST_SUCCESS,
					siteId: null,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
						},
					],
				} )
			);

			const state = allSitesQueries( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				data: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
						},
					},
					queries: {
						'[["search","Hello"]]': {
							itemKeys: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ],
							found: 1,
						},
					},
				},
				options: {
					itemKey: 'global_ID',
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				data: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': {
							ID: 841,
							site_ID: 2916284,
							global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
							title: 'Hello World',
						},
					},
					queries: {
						'[["search","Hello"]]': {
							itemKeys: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ],
							found: 1,
						},
					},
				},
				options: {
					itemKey: 'global_ID',
				},
			} );

			const state = allSitesQueries( original, { type: DESERIALIZE } );

			expect( state ).to.eql(
				new PostQueryManager(
					{
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': {
								ID: 841,
								global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
								site_ID: 2916284,
								title: 'Hello World',
							},
						},
						queries: {
							'[["search","Hello"]]': {
								found: 1,
								itemKeys: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ],
							},
						},
					},
					{ itemKey: 'global_ID' }
				)
			);
		} );

		test( 'should not load invalid persisted state', () => {
			const original = '{INVALID';

			const state = allSitesQueries( original, { type: DESERIALIZE } );

			expect( state ).to.be.an.instanceof( PostQueryManager );
			expect( state.data ).to.eql( { items: {}, queries: {} } );
			expect( state.options ).to.eql( { itemKey: 'global_ID' } );
		} );
	} );
} );
