/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_FAILURE,
	POSTS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	items,
	sitePosts,
	siteQueries,
	siteQueriesLastPage
} from '../reducer';

describe( 'reducer', () => {
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
			const original = Object.freeze( {
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
			const original = Object.freeze( {
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

		it( 'never persists state because this is not implemented', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state because this is not implemented', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#sitePosts()', () => {
		it( 'should default to an empty object', () => {
			const state = sitePosts( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should map site ID, post ID pair to global ID', () => {
			const state = sitePosts( null, {
				type: POSTS_RECEIVE,
				posts: [ { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } ]
			} );

			expect( state ).to.eql( {
				2916284: {
					841: '3d097cb7c5473c169bba0eb8e3c6cb64'
				}
			} );
		} );
		it( 'never persists state because this is not implemented', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = sitePosts( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state because this is not implemented', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = sitePosts( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#siteQueries()', () => {
		it( 'should default to an empty object', () => {
			const state = siteQueries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track site post query request fetching', () => {
			const state = siteQueries( null, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"hello"}': {
						fetching: true
					}
				}
			} );
		} );

		it( 'should preserve previous query results when requesting again', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': {
						fetching: false,
						posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
					}
				}
			} );
			const state = siteQueries( original, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"hello"}': {
						fetching: true,
						posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
					}
				}
			} );
		} );

		it( 'should accumulate site queries', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': {
						fetching: true
					}
				}
			} );
			const state = siteQueries( original, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello W' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"hello"}': {
						fetching: true
					},
					'{"search":"hello w"}': {
						fetching: true
					}
				}
			} );
		} );

		it( 'should track site post query request success', () => {
			const state = siteQueries( null, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				found: 1,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"hello"}': {
						fetching: false,
						posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
					}
				}
			} );
		} );

		it( 'should track site post query request failure', () => {
			const state = siteQueries( null, {
				type: POSTS_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Hello' },
				error: new Error()
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"hello"}': {
						fetching: false
					}
				}
			} );
		} );

		it( 'never persists state because this is not implemented', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': {
						fetching: true
					}
				}
			} );
			const state = siteQueries( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state because this is not implemented', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': {
						fetching: true
					}
				}
			} );
			const state = siteQueries( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#siteQueriesLastPage()', () => {
		it( 'should default to an empty object', () => {
			const state = siteQueriesLastPage( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track site post query request success last page', () => {
			const state = siteQueriesLastPage( null, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: '', number: 1 },
				found: 2,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"number":1}': 2
				}
			} );
		} );

		it( 'should track last page regardless of page param', () => {
			const state = siteQueriesLastPage( null, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: '', number: 1, page: 2 },
				found: 2,
				posts: [
					{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"number":1}': 2
				}
			} );
		} );

		it( 'should consider no results as having last page of 1', () => {
			const state = siteQueriesLastPage( null, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'none', number: 1 },
				found: 0,
				posts: []
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"none","number":1}': 1
				}
			} );
		} );

		it( 'should accumulate site post request success', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': 1
				}
			} );
			const state = siteQueriesLastPage( original, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Ribs' },
				found: 1,
				posts: [
					{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"hello"}': 1,
					'{"search":"ribs"}': 1
				}
			} );
		} );

		it( 'never persists state because this is not implemented', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': 1
				}
			} );
			const state = siteQueriesLastPage( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state because this is not implemented', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"hello"}': 1
				}
			} );
			const state = siteQueriesLastPage( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );
} );
