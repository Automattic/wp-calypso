/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	POST_DELETE,
	POST_EDIT,
	POST_EDITS_RESET,
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_SAVE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_FAILURE,
	POSTS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	items,
	queryRequests,
	queries,
	siteRequests,
	edits
} from '../reducer';
import PostQueryManager from 'lib/query-manager/post';

describe( 'reducer', () => {
	before( () => {
		sinon.stub( console, 'warn' );
	} );

	after( () => {
		console.warn.restore();
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'counts',
			'items',
			'siteRequests',
			'queryRequests',
			'queries',
			'edits'
		] );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index posts by global ID', () => {
			const state = items( null, {
				type: POSTS_RECEIVE,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
					{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				]
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should accumulate posts', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POSTS_RECEIVE,
				posts: [ { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' } ]
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should override previous post of same ID', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POSTS_RECEIVE,
				posts: [ { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' } ]
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should remove an item when delete action is dispatched', () => {
			const original = deepFreeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 841
			} );

			expect( state ).to.eql( {} );
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					}
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					}
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 'foo',
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					}
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#queryRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track post query request fetching', () => {
			const state = queryRequests( undefined, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"hello"}': true
			} );
		} );

		it( 'should track post queries without specified site', () => {
			const state = queryRequests( undefined, {
				type: POSTS_REQUEST,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				'{"search":"hello"}': true
			} );
		} );

		it( 'should accumulate queries', () => {
			const original = deepFreeze( {
				'2916284:{"search":"hello"}': true
			} );

			const state = queryRequests( original, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello W' }
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"hello"}': true,
				'2916284:{"search":"hello w"}': true
			} );
		} );

		it( 'should track post query request success', () => {
			const state = queryRequests( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				]
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"hello"}': false
			} );
		} );

		it( 'should track post query request failure', () => {
			const state = queryRequests( undefined, {
				type: POSTS_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Hello' },
				error: new Error()
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"hello"}': false
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				'2916284:{"search":"hello"}': true
			} );

			const state = queryRequests( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				'2916284:{"search":"hello"}': true
			} );

			const state = queryRequests( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#queries()', () => {
		it( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track post query request success', () => {
			const state = queries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				]
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( PostQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Hello' } ) ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			] );
		} );

		it( 'should accumulate query request success', () => {
			const original = deepFreeze( queries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'publish', type: 'post' }
				]
			} ) );

			const state = queries( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello W' },
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'publish', type: 'post' }
				]
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( PostQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Hello' } ) ).to.have.length( 1 );
			expect( state[ 2916284 ].getItems( { search: 'Hello W' } ) ).to.have.length( 1 );
		} );

		it( 'should update received posts', () => {
			const original = deepFreeze( queries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'publish', type: 'post' }
				]
			} ) );

			const state = queries( original, {
				type: POSTS_RECEIVE,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'draft', type: 'post' }
				]
			} );

			expect( state[ 2916284 ].getItem( 841 ) ).to.eql(
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'draft', type: 'post' }
			);
		} );

		it( 'should apply save actions as partial received posts', () => {
			const original = deepFreeze( queries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'draft', type: 'post' }
				]
			} ) );

			const state = queries( original, {
				type: POST_SAVE,
				siteId: 2916284,
				postId: 841,
				post: {
					status: 'trash'
				}
			} );

			expect( state[ 2916284 ].getItem( 841 ) ).to.eql(
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'trash', type: 'post' }
			);
		} );

		it( 'should remove item when post delete action dispatched', () => {
			const original = deepFreeze( queries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World', status: 'trash', type: 'post' }
				]
			} ) );

			const state = queries( original, {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 841
			} );

			expect( state[ 2916284 ].getItems() ).to.have.length( 0 );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( queries( undefined, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				]
			} ) );

			const state = queries( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should load persisted state', () => {
			const original = deepFreeze( {
				2916284: '{}'
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#siteRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = siteRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should map site ID, post ID to true value if request in progress', () => {
			const state = siteRequests( undefined, {
				type: POST_REQUEST,
				siteId: 2916284,
				postId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					841: true
				}
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = siteRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: POST_REQUEST,
				siteId: 2916284,
				postId: 413
			} );

			expect( state ).to.eql( {
				2916284: {
					841: true,
					413: true
				}
			} );
		} );

		it( 'should map site ID, post ID to false value if request finishes successfully', () => {
			const state = siteRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: POST_REQUEST_SUCCESS,
				siteId: 2916284,
				postId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					841: false
				}
			} );
		} );

		it( 'should map site ID, post ID to false value if request finishes with failure', () => {
			const state = siteRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: POST_REQUEST_FAILURE,
				siteId: 2916284,
				postId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					841: false
				}
			} );
		} );

		it( 'never persists state', () => {
			const state = siteRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = siteRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#edits()', () => {
		it( 'should default to an empty object', () => {
			const state = edits( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track new post draft revisions by site ID', () => {
			const state = edits( undefined, {
				type: POST_EDIT,
				siteId: 2916284,
				post: { title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} );
		} );

		it( 'should track existing post revisions by site ID, post ID', () => {
			const state = edits( undefined, {
				type: POST_EDIT,
				siteId: 2916284,
				postId: 841,
				post: { title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					841: {
						title: 'Hello World'
					}
				}
			} );
		} );

		it( 'should accumulate posts', () => {
			const state = edits( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: POST_EDIT,
				siteId: 2916284,
				postId: 841,
				post: { title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					},
					841: {
						title: 'Hello World'
					}
				}
			} );
		} );

		it( 'should accumulate sites', () => {
			const state = edits( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: POST_EDIT,
				siteId: 77203074,
				postId: 841,
				post: { title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				},
				77203074: {
					841: {
						title: 'Hello World'
					}
				}
			} );
		} );

		it( 'should merge post revisions', () => {
			const state = edits( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: POST_EDIT,
				siteId: 2916284,
				post: { content: 'Delicious.' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken',
						content: 'Delicious.'
					}
				}
			} );
		} );

		it( 'should merge nested post revisions', () => {
			const state = edits( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken',
						discussion: {
							comments_open: false
						}
					}
				}
			} ), {
				type: POST_EDIT,
				siteId: 2916284,
				post: {
					discussion: {
						pings_open: false
					}
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken',
						discussion: {
							comments_open: false,
							pings_open: false
						}
					}
				}
			} );
		} );

		it( 'should should eliminate redundant data on posts received', () => {
			const state = edits( deepFreeze( {
				2916284: {
					841: {
						title: 'Hello World',
						type: 'post'
					},
					'': {
						title: 'Unrelated'
					}
				}
			} ), {
				type: POSTS_RECEIVE,
				posts: [ { ID: 841, site_ID: 2916284, type: 'post' } ]
			} );

			expect( state ).to.eql( {
				2916284: {
					841: {
						title: 'Hello World'
					},
					'': {
						title: 'Unrelated'
					}
				}
			} );
		} );

		it( 'should ignore reset edits action when discarded site doesn\'t exist', () => {
			const original = deepFreeze( {} );
			const state = edits( original, {
				type: POST_EDITS_RESET,
				siteId: 2916284,
				postId: 841
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should discard edits when reset edits action dispatched', () => {
			const state = edits( deepFreeze( {
				2916284: {
					841: {
						title: 'Hello World'
					},
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: POST_EDITS_RESET,
				siteId: 2916284,
				postId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = edits( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = edits( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
