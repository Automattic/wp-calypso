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
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { items } from '../reducer';

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
} );
