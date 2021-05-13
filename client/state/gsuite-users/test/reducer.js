/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { usersReducer } from '../reducer';

import { GSUITE_USERS_REQUEST_SUCCESS } from 'calypso/state/action-types';

describe( "gsuiteUsersReducer's", () => {
	const account = {
		agreed_to_terms: false,
		domain: 'test.blog',
		email: 'a@test.blog',
		firstname: 'User',
		fullname: 'User One',
		is_admin: true,
		lastname: 'One',
		mailbox: 'a',
		site_id: 1,
		suspended: false,
	};

	describe( 'users sub-reducer', () => {
		test( 'should default to null', () => {
			const state = usersReducer( undefined, {} );

			expect( state ).to.eql( null );
		} );

		test( 'should return new items received', () => {
			const state = usersReducer( null, {
				type: GSUITE_USERS_REQUEST_SUCCESS,
				response: { accounts: [ account ] },
			} );

			expect( state ).to.eql( [ account ] );
		} );
	} );
} );
