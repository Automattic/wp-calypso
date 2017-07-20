/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';
import { emails, isEnabled, comments, share, removableShare, initialShareState } from '../reducer';

describe( 'reducer', () => {
	describe( 'emails', () => {
		it( 'sets initial state to an empty array', () => {
			const initialState = emails( undefined, { type: '@@calypso/INIT' } );
			expect( initialState ).to.be.an( 'array' ).that.is.empty;
		} );

		it( 'should add an email', () => {
			const stateA = emails( [], {
				type: DRAFT_FEEDBACK_SHARE_ADD,
				emailAddress: 'a-test@example.com',
			} );
			expect( stateA ).to.eql( [ 'a-test@example.com' ] );

			const stateB = emails( stateA, {
				type: DRAFT_FEEDBACK_SHARE_ADD,
				emailAddress: 'b-test@example.com',
			} );
			expect( stateB ).to.eql( [ 'a-test@example.com', 'b-test@example.com' ] );
		} );

		it( 'should remove an email', () => {
			const stateA = emails( [ 'a-test@example.com', 'b-test@example.com' ], {
				type: DRAFT_FEEDBACK_SHARE_REMOVE,
				emailAddress: 'a-test@example.com',
			} );
			expect( stateA ).to.eql( [ 'b-test@example.com' ] );

			const stateB = emails( stateA, {
				type: DRAFT_FEEDBACK_SHARE_REMOVE,
				emailAddress: 'b-test@example.com',
			} );
			expect( stateB ).to.eql( [] );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'sets initial state to enabled', () => {
			const initialState = isEnabled( undefined, { type: '@@calypso/INIT' } );
			expect( initialState ).to.be.true;
		} );
		it( 'disables', () => {
			const state = isEnabled( true, { type: DRAFT_FEEDBACK_SHARE_REVOKE } );
			expect( state ).to.be.false;
		} );
		it( 'enables', () => {
			const state = isEnabled( false, { type: DRAFT_FEEDBACK_SHARE_RESTORE } );
			expect( state ).to.be.true;
		} );
	} );

	describe( 'comments', () => {
		it( 'sets initial state to an empty array', () => {
			const initialState = comments( undefined, { type: '@@calypso/INIT' } );
			expect( initialState ).to.be.an( 'array' ).that.is.empty;
		} );
		it( 'adds a comment', () => {
			const stateA = comments( [], {
				type: DRAFT_FEEDBACK_COMMENT_ADD,
				comment: 'comment1',
			} );
			expect( stateA ).to.eql( [ 'comment1' ] );

			const stateB = comments( stateA, {
				type: DRAFT_FEEDBACK_COMMENT_ADD,
				comment: 'comment2',
			} );
			expect( stateB ).to.eql( [ 'comment1', 'comment2' ] );
		} );
	} );

	describe( 'removableShare', () => {
		it( 'removes a share', () => {
			const state = removableShare( {}, {
				type: DRAFT_FEEDBACK_SHARE_REMOVE
			} );
			expect( state ).to.be.undefined;
		} );
	} );

	describe( 'initialShareState', () => {
		it( 'is the initial share state', () => {
			expect( initialShareState ).to.eql( share( undefined, { type: '@@calypso/INIT' } ) );
		} );
	} );
} );
