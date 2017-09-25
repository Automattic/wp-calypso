/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { receiveUser } from '../actions';
import { USER_RECEIVE } from 'state/action-types';

describe( 'actions', () => {
	describe( '#receiveUser()', () => {
		it( 'should return an action object', () => {
			const user = { ID: 73705554, login: 'testonesite2014' };
			const action = receiveUser( user );

			expect( action ).to.eql( {
				type: USER_RECEIVE,
				user
			} );
		} );
	} );
} );
