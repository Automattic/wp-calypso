import { expect } from 'chai';
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import { setCurrentUser } from '../actions';

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
