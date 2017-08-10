/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET } from 'state/action-types';
import { setCurrentUserId } from '../actions';

describe( 'actions', () => {
	describe( '#setCurrentUserId()', () => {
		it( 'should return an action object', () => {
			const action = setCurrentUserId( 73705554 );

			expect( action ).to.eql( {
				type: CURRENT_USER_ID_SET,
				userId: 73705554,
			} );
		} );
	} );
} );
