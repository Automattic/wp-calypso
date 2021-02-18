/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setCurrentUser } from '../actions';
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#setCurrentUser()', () => {
		test( 'should return an action object', () => {
			const action = setCurrentUser( { ID: 73705554 } );

			expect( action ).to.eql( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: 73705554 },
			} );
		} );
	} );
} );
