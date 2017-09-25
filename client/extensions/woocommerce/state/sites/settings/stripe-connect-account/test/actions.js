/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createAccount } from '../actions';
import { WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#createAccount()', () => {
		const siteId = '123';
		const email = 'foo@bar.com';
		const countryCode = 'US';
		it( 'should return an action', () => {
			const action = createAccount( siteId, email, countryCode );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
				siteId,
				email,
				countryCode
			} );
		} );
	} );
} );
