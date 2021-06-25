/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { emailAccountsReducer } from '../reducer';

import { EMAIL_ACCOUNTS_REQUEST_SUCCESS } from 'calypso/state/action-types';

describe( "emailAccountsReducer's", () => {
	const account = {
		domain_name: 'test.blog',
		product_name: 'G Suite Basic',
		product_slug: 'gapps',
		product_type: 'gapps',
		site_id: 1,
		mailboxes: [
			{
				name: 'user',
				first_name: 'User',
				last_name: 'One',
				state: 'suspended',
			},
		],
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
