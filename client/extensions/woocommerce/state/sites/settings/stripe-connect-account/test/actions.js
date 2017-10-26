/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createAccount, fetchAccountDetails } from '../actions';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#createAccount()', () => {
		const siteId = '123';
		const email = 'foo@bar.com';
		const countryCode = 'US';
		test( 'should return an action', () => {
			const action = createAccount( siteId, email, countryCode );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
				siteId,
				email,
				countryCode,
			} );
		} );
	} );

	describe( '#fetchAccountDetails()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = fetchAccountDetails( siteId );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
				siteId,
			} );
		} );
	} );
} );
