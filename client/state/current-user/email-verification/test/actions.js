/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { verifyEmail, resetVerifyEmailState } from '../actions';
import { EMAIL_VERIFY_REQUEST, EMAIL_VERIFY_STATE_RESET } from 'state/action-types';

describe( 'actions', () => {
	describe( '#verifyEmail', () => {
		it( 'returns request action', () => {
			const result = verifyEmail();
			expect( result ).to.eql( { type: EMAIL_VERIFY_REQUEST } );
		} );
	} );

	describe( '#resetVerifyEmailState', () => {
		it( 'returns reset action', () => {
			const result = resetVerifyEmailState();
			expect( result ).to.eql( { type: EMAIL_VERIFY_STATE_RESET } );
		} );
	} );
} );
