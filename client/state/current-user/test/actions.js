/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setCurrentUserId } from '../actions';
import { CURRENT_USER_ID_SET } from 'client/state/action-types';

describe( 'actions', () => {
	describe( '#setCurrentUserId()', () => {
		test( 'should return an action object', () => {
			const action = setCurrentUserId( 73705554 );

			expect( action ).to.eql( {
				type: CURRENT_USER_ID_SET,
				userId: 73705554,
			} );
		} );
	} );
} );
