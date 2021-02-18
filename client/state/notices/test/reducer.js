/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { NOTICE_CREATE, NOTICE_REMOVE, ROUTE_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		describe( 'NOTICE_CREATE', () => {
			test( 'should properly add new notice', () => {
				const notice = { noticeId: 1, text: 'Example Notice Text' };
				const original = deepFreeze( {} );
				const state = items( original, {
					type: NOTICE_CREATE,
					notice: notice,
				} );

				expect( state ).toEqual( {
					1: notice,
				} );
			} );
		} );

		describe( 'NOTICE_REMOVE', () => {
			test( 'should properly remove selected notice', () => {
				const original = deepFreeze( {
					1: { noticeId: 1 },
					2: { noticeId: 2 },
					3: { noticeId: 3 },
				} );
				const state = items( original, {
					type: NOTICE_REMOVE,
					noticeId: 2,
				} );

				expect( state ).toEqual( {
					1: { noticeId: 1 },
					3: { noticeId: 3 },
				} );
			} );

			test( 'should return same state on remove attempt if notice not tracked', () => {
				const original = deepFreeze( {
					1: { noticeId: 1 },
					3: { noticeId: 3 },
				} );
				const state = items( original, {
					type: NOTICE_REMOVE,
					noticeId: 2,
				} );

				expect( state ).toBe( original );
			} );
		} );

		describe( 'ROUTE_SET', () => {
			test( 'should remove notices on route set', () => {
				const original = deepFreeze( {
					1: { noticeId: 1 },
				} );
				const state = items( original, {
					type: ROUTE_SET,
				} );

				expect( state ).toEqual( {} );
			} );

			test( 'should preserve persistent notices on route set', () => {
				const original = deepFreeze( {
					1: { noticeId: 1 },
					2: { noticeId: 2, isPersistent: true },
				} );
				const state = items( original, {
					type: ROUTE_SET,
				} );

				expect( state ).toEqual( {
					2: { noticeId: 2, isPersistent: true },
				} );
			} );

			test( 'should preserve altered notice to be displayed on next page on route set', () => {
				const original = deepFreeze( {
					1: { noticeId: 1 },
					2: { noticeId: 2, displayOnNextPage: true },
				} );
				const state = items( original, {
					type: ROUTE_SET,
				} );

				expect( state ).toEqual( {
					2: { noticeId: 2, displayOnNextPage: false },
				} );
			} );
		} );
	} );
} );
