/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { NOTICE_CREATE, NOTICE_REMOVE, ROUTE_SET } from 'client/state/action-types';

describe( 'reducer', () => {
	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		describe( 'NOTICE_CREATE', () => {
			test( 'should properly add new notice', () => {
				const notice = { noticeId: 1, text: 'Example Notice Text' };
				const original = deepFreeze( {} );
				const state = items( original, {
					type: NOTICE_CREATE,
					notice: notice,
				} );

				expect( state ).to.eql( {
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

				expect( state ).to.eql( {
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

				expect( state ).to.equal( original );
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

				expect( state ).to.eql( {} );
			} );

			test( 'should preserve persistent notices on route set', () => {
				const original = deepFreeze( {
					1: { noticeId: 1 },
					2: { noticeId: 2, isPersistent: true },
				} );
				const state = items( original, {
					type: ROUTE_SET,
				} );

				expect( state ).to.eql( {
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

				expect( state ).to.eql( {
					2: { noticeId: 2, displayOnNextPage: false },
				} );
			} );
		} );
	} );
} );
