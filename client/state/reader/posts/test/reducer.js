/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { items, seen } from '../reducer';
import { READER_POST_SEEN, READER_POSTS_RECEIVE } from 'state/reader/action-types';

const receivePosts = ( posts ) => ( { type: READER_POSTS_RECEIVE, posts } );
const see = ( post ) => ( { type: READER_POST_SEEN, payload: { post } } );

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add received posts to the set', () => {
			const posts = [ { global_ID: 1 }, { global_ID: 2 } ];
			const prevState = {};
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState ).toEqual( {
				[ posts[ 0 ].global_ID ]: posts[ 0 ],
				[ posts[ 1 ].global_ID ]: posts[ 1 ],
			} );
		} );

		test( 'should overwrite already existing post with a new one', () => {
			const posts = [ { global_ID: 1 } ];
			const prevState = { [ 1 ]: {} };
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState ).toEqual( { 1: posts[ 0 ] } );
		} );
	} );

	describe( '#seen()', () => {
		test( 'should default to an empty object', () => {
			const state = seen( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add new post ids to the set of seen', () => {
			const post = { global_ID: 1 };
			const nextState = seen( {}, see( post ) );

			expect( nextState ).toEqual( { 1: true } );
		} );
	} );
} );
