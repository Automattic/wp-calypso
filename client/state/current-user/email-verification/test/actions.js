/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { verifyEmail, resetVerifyEmailState } from '../actions';
import { EMAIL_VERIFY_REQUEST, EMAIL_VERIFY_STATE_RESET } from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#verifyEmail', () => {
		test( 'returns request action', () => {
			const result = verifyEmail();
			expect( result ).to.eql( { type: EMAIL_VERIFY_REQUEST, showGlobalNotices: false } );
		} );

		test( 'returns request action with notices', () => {
			const result = verifyEmail( { showGlobalNotices: true } );
			expect( result ).to.eql( { type: EMAIL_VERIFY_REQUEST, showGlobalNotices: true } );
		} );
	} );

	describe( '#resetVerifyEmailState', () => {
		test( 'returns reset action', () => {
			const result = resetVerifyEmailState();
			expect( result ).to.eql( { type: EMAIL_VERIFY_STATE_RESET } );
		} );
	} );
} );
