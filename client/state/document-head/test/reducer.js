import deepFreeze from 'deep-freeze';
import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET,
	ROUTE_SET,
} from 'calypso/state/action-types';
import { DEFAULT_META_STATE, link, meta, title, unreadCount } from '../reducer';

describe( 'reducer', () => {
	describe( '#title()', () => {
		test( 'should default to an empty string', () => {
			const state = title( undefined, {} );

			expect( state ).toBe( '' );
		} );

		test( 'should properly set a new title', () => {
			const newState = title( undefined, { type: DOCUMENT_HEAD_TITLE_SET, title: 'new title' } );

			expect( newState ).toBe( 'new title' );
		} );
	} );

	describe( '#unreadCount()', () => {
		test( 'should default to a zero', () => {
			const state = unreadCount( undefined, {} );

			expect( state ).toBe( 0 );
		} );

		test( 'should properly set a new unread count', () => {
			const newState = unreadCount( undefined, {
				type: DOCUMENT_HEAD_UNREAD_COUNT_SET,
				count: 123,
			} );

			expect( newState ).toBe( 123 );
		} );

		it( 'should return initial state on route set action', () => {
			const original = 123;
			const state = unreadCount( original, { type: ROUTE_SET } );

			expect( state ).toBe( 0 );
		} );
	} );

	describe( '#meta()', () => {
		test( 'should default to "og:site_name" set to "WordPress.com" array', () => {
			const state = meta( undefined, {} );

			expect( state ).toEqual( DEFAULT_META_STATE );
		} );

		test( 'should set a new meta tag', () => {
			const state = deepFreeze( [ { content: 'some content', type: 'some type' } ] );
			const newState = meta( state, {
				type: DOCUMENT_HEAD_META_SET,
				meta: [
					{
						content: 'another content',
						type: 'another type',
					},
				],
			} );

			const expectedState = [ { content: 'another content', type: 'another type' } ];

			expect( newState ).toEqual( expectedState );
		} );
	} );

	describe( '#link()', () => {
		test( 'should default to an empty array', () => {
			const state = link( undefined, {} );

			expect( state ).toEqual( [] );
		} );

		test( 'should set a new link tag', () => {
			const state = deepFreeze( [ { rel: 'some-rel', href: 'https://wordpress.org' } ] );
			const newState = link( state, {
				type: DOCUMENT_HEAD_LINK_SET,
				link: {
					rel: 'another-rel',
					href: 'https://automattic.com',
				},
			} );

			const expectedState = [
				{ rel: 'some-rel', href: 'https://wordpress.org' },
				{ rel: 'another-rel', href: 'https://automattic.com' },
			];

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should deduplicate when setting new link tags', () => {
			const state = deepFreeze( [ { rel: 'some-rel', href: 'https://wordpress.org' } ] );
			const newState = link( state, {
				type: DOCUMENT_HEAD_LINK_SET,
				link: [
					{ rel: 'some-rel', href: 'https://wordpress.org' },
					{ rel: 'another-rel', href: 'https://automattic.com' },
				],
			} );

			const expectedState = [
				{ rel: 'some-rel', href: 'https://wordpress.org' },
				{ rel: 'another-rel', href: 'https://automattic.com' },
			];

			expect( newState ).toEqual( expectedState );
		} );
	} );
} );
