/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { emailAccountsReducer } from '../reducer';

import { EMAIL_ACCOUNTS_REQUEST_SUCCESS } from 'state/action-types';

describe( "emailAccountsReducer's", () => {
	const account = {
		email: 'a@test.blog',
		domain: 'test.blog',
		first_name: 'User',
		last_name: 'One',
		site_id: 1,
		is_suspended: false,
		provider_slug: 'gsuite',
	};

	describe( 'accounts sub-reducer', () => {
		test( 'should default to null', () => {
			const state = emailAccountsReducer( undefined, {} );

			expect( state ).to.eql( null );
		} );

		test( 'should return new items received', () => {
			const state = emailAccountsReducer( null, {
				type: EMAIL_ACCOUNTS_REQUEST_SUCCESS,
				response: { accounts: [ account ] },
			} );

			expect( state ).to.eql( [ account ] );
		} );
	} );
} );
