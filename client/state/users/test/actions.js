/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { USER_RECEIVE } from 'state/action-types';
import { receiveUser } from '../actions';

describe( 'actions', () => {
	describe( '#receiveUser()', () => {
		it( 'should return an action object', () => {
			const user = { ID: 73705554, login: 'testonesite2014' };
			const action = receiveUser( user );

			expect( action ).to.eql( {
				type: USER_RECEIVE,
				user,
			} );
		} );
	} );
} );
