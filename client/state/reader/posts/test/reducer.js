import { READER_POST_SEEN, READER_POSTS_RECEIVE } from 'calypso/state/reader/action-types';
import { items, seen } from '../reducer';

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

		test( 'should merge incoming post with existing when global_ID matches', () => {
			const posts = [ { global_ID: 1, title: 'Updated' } ];
			const prevState = { 1: { global_ID: 1, title: 'Old' } };
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState ).toEqual( { 1: { global_ID: 1, title: 'Updated' } } );
		} );

		test( 'should preserve featured_image when incoming post has empty string', () => {
			const posts = [ { global_ID: 'a', featured_image: '' } ];
			const prevState = {
				a: { global_ID: 'a', featured_image: 'https://example.com/hero.jpg' },
			};
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState.a.featured_image ).toBe( 'https://example.com/hero.jpg' );
		} );

		test( 'should preserve canonical_media when incoming omits it', () => {
			const canonical = { mediaType: 'image', src: 'https://example.com/hero.jpg' };
			const posts = [ { global_ID: 'b' } ];
			const prevState = { b: { global_ID: 'b', canonical_media: canonical } };
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState.b.canonical_media ).toEqual( canonical );
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
