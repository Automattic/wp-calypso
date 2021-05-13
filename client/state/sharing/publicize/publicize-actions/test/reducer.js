/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { schedulingSharePostActionStatus, updateDataForPost } from '../reducer';
import {
	PUBLICIZE_SHARE_DISMISS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( 'updateDataForPost()', () => {
		const nestedStateTree = deepFreeze( {
			99: {
				test: 'valueNotToChange',
			},
			1: {
				2: {
					3: 'valueToChange',
					4: 'valueNotToChange',
				},
				5: 'valueNotToChange',
			},
		} );

		test( 'should only change deeply nested value with proper siteId, postId and actionId', () => {
			const state = updateDataForPost( 'newValue', nestedStateTree, 1, 2, 3 );
			expect( state[ 1 ][ 2 ][ 3 ] ).to.equal( 'newValue' );
			expect( state[ 1 ][ 2 ][ 4 ] ).to.equal( 'valueNotToChange' );
			expect( state[ 1 ][ 5 ] ).to.equal( 'valueNotToChange' );
			expect( state[ 99 ].test ).to.equal( 'valueNotToChange' );
		} );

		test( 'should only change deeply nested value with proper siteId, postId when without actionId', () => {
			const state = updateDataForPost( 'newValue', nestedStateTree, 1, 2 );
			expect( state[ 1 ][ 2 ] ).to.equal( 'newValue' );
			expect( state[ 1 ][ 5 ] ).to.equal( 'valueNotToChange' );
			expect( state[ 99 ].test ).to.equal( 'valueNotToChange' );
		} );
	} );

	describe( 'schedulingSharePostActionStatus()', () => {
		test( 'should change to `requesting` after requesting an action scheduling', () => {
			const state = schedulingSharePostActionStatus( null, {
				type: PUBLICIZE_SHARE_ACTION_SCHEDULE,
				siteId: 2916284,
				postId: 5,
			} );

			expect( state[ 2916284 ][ 5 ].status ).to.equal( 'requesting' );
		} );

		test( 'should change to `failure` after requesting an action scheduling failed', () => {
			const state = schedulingSharePostActionStatus( null, {
				type: PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE,
				siteId: 2916284,
				postId: 5,
			} );

			expect( state[ 2916284 ][ 5 ].status ).to.equal( 'failure' );
		} );

		test( 'should change to `success` and pass share date after request success', () => {
			const state = schedulingSharePostActionStatus( null, {
				type: PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS,
				siteId: 2916284,
				postId: 5,
				share_date: 3,
			} );

			expect( state[ 2916284 ][ 5 ].status ).to.equal( 'success' );
			expect( state[ 2916284 ][ 5 ].shareDate ).to.equal( 3 );
		} );

		test( 'should not be defined after dismissing a notice', () => {
			const previousState = {
				2916284: {
					5: {
						status: 'success',
					},
				},
			};
			const state = schedulingSharePostActionStatus( previousState, {
				type: PUBLICIZE_SHARE_DISMISS,
				siteId: 2916284,
				postId: 5,
			} );

			expect( state[ 2916284 ][ 5 ] ).to.be.undefined;
		} );
	} );
} );
