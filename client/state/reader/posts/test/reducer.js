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

		test( 'should preserve canonical_media when incoming has empty src', () => {
			const good = {
				mediaType: 'image',
				src: 'https://good.example/img.jpg',
				width: 100,
				height: 100,
			};
			const posts = [ { global_ID: 'c', canonical_media: { mediaType: 'image', src: '' } } ];
			const prevState = { c: { global_ID: 'c', canonical_media: good } };
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState.c.canonical_media ).toEqual( good );
		} );

		test( 'should preserve canonical_media when incoming image omits src', () => {
			const good = {
				mediaType: 'image',
				src: 'https://good.example/img.jpg',
				width: 200,
				height: 150,
			};
			const posts = [ { global_ID: 'd', canonical_media: { mediaType: 'image' } } ];
			const prevState = { d: { global_ID: 'd', canonical_media: good } };
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState.d.canonical_media ).toEqual( good );
		} );

		test( 'should preserve canonical_image when incoming has empty uri', () => {
			const good = { uri: 'https://good.example/thumb.jpg', width: 50, height: 50 };
			const posts = [ { global_ID: 'e', canonical_image: { uri: '', width: 0, height: 0 } } ];
			const prevState = { e: { global_ID: 'e', canonical_image: good } };
			const nextState = items( prevState, receivePosts( posts ) );

			expect( nextState.e.canonical_image ).toEqual( good );
		} );

		test( 'should pull media from sibling post with different global_ID for same feed item', () => {
			const fullFromSingle = {
				global_ID: 'aaa',
				feed_ID: 1,
				feed_item_ID: 99,
				site_ID: 2,
				ID: 3,
				featured_image: 'https://example.com/hero.jpg',
				canonical_media: {
					mediaType: 'image',
					src: 'https://example.com/hero.jpg',
					width: 100,
					height: 100,
				},
			};
			const thinFromStream = {
				global_ID: 'bbb',
				feed_ID: 1,
				feed_item_ID: 99,
				site_ID: 2,
				ID: 3,
				featured_image: '',
				canonical_media: { mediaType: 'image', src: '' },
			};
			const prevState = { aaa: fullFromSingle };
			const nextState = items( prevState, receivePosts( [ thinFromStream ] ) );

			expect( nextState.bbb.featured_image ).toBe( 'https://example.com/hero.jpg' );
			expect( nextState.bbb.canonical_media ).toEqual( fullFromSingle.canonical_media );
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
