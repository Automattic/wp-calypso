/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE,
	CLICK_NOTICE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { items, clicked } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty array', () => {
			const state = items( undefined, [] );
			expect( state ).to.eql( [] );
		} );

		it( 'should properly add new notice', () => {
			const notice = { text: 'Example Notice Text' },
				state = items( undefined, {
					type: NEW_NOTICE,
					notice: notice
				} );

			expect( state ).to.eql( [ notice ] );
		} );

		it( 'should properly remove selected notice', () => {
			const notices = [
					{ noticeId: 1 },
					{ noticeId: 2 },
					{ noticeId: 3 }
				],
				state = items( notices, {
					type: REMOVE_NOTICE,
					noticeId: 2
				} );

			expect( state ).to.eql( [
				{ noticeId: 1 },
				{ noticeId: 3 }
			] );
		} );

		it( 'should properly replace old notice with new notice that has the same ID', () => {
			const notices = [
				{ noticeId: 1 },
				{ noticeId: 2 },
				{ noticeId: 3 }
			];
			const notice = { noticeId: 2, text: 'Example Notice Text' };
			const state = items( notices, {
				type: NEW_NOTICE,
				notice: notice
			} );
			expect( state ).to.eql( [ notices[0], notice, notices[2] ] );
		} );

		it( 'never persists state', () => {
			const notices = [
				{ noticeId: 1 },
				{ noticeId: 2 },
				{ noticeId: 3 }
			];
			const state = items( notices, { type: SERIALIZE } );
			expect( state ).to.eql( [] );
		} );

		it( 'never loads persisted state', () => {
			const notices = [
				{ noticeId: 1 },
				{ noticeId: 2 },
				{ noticeId: 3 }
			];
			const state = items( notices, { type: DESERIALIZE } );
			expect( state ).to.eql( [] );
		} );
	} );

	describe( '#clicked()', () => {
		it( 'should default to null', () => {
			const state = clicked( undefined,  {} );
			expect( state ).to.eql( null );
		} );

		it( 'should store the notice ID of clicked action button', () => {
			const state = clicked( null, { type: CLICK_NOTICE, noticeId: 1 } );
			expect( state ).to.eql( 1 );
		} );

		it( 'should reset the state only when the notice is removed', () => {
			let state = clicked( 1, { type: REMOVE_NOTICE, noticeId: 2 } );
			expect( state ).to.eql( 1 );

			state = clicked( 1, { type: REMOVE_NOTICE, noticeId: 1 });
			expect( state ).to.eql( null );
		} );
	} );
} );
