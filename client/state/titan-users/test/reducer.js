/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { usersReducer } from '../reducer';

import { TITAN_USERS_REQUEST_SUCCESS } from 'state/action-types';

describe( "titanUsersReducer's", () => {
	const account = {
		mailbox: 'a',
		domain: 'test.blog',
		email: 'a@test.blog',
		firstname: 'User',
		lastname: 'One',
		fullname: 'User One',
		site_id: 1,
		suspended: false,
		agreed_to_terms: false,
	};

	describe( 'users sub-reducer', () => {
		test( 'should default to null', () => {
			const state = usersReducer( undefined, {} );

			expect( state ).to.eql( null );
		} );

		test( 'should return new items received', () => {
			const state = usersReducer( null, {
				type: TITAN_USERS_REQUEST_SUCCESS,
				response: { accounts: [ account ] },
			} );

			expect( state ).to.eql( [ account ] );
		} );
	} );
} );
