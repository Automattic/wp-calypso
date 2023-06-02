import { EMAIL_VERIFY_REQUEST, EMAIL_VERIFY_STATE_RESET } from 'calypso/state/action-types';
import { verifyEmail, resetVerifyEmailState } from '../actions';

describe( 'actions', () => {
	describe( '#verifyEmail', () => {
		test( 'returns request action', () => {
			const result = verifyEmail();
			expect( result ).toEqual( { type: EMAIL_VERIFY_REQUEST, showGlobalNotices: false } );
		} );

		test( 'returns request action with notices', () => {
			const result = verifyEmail( { showGlobalNotices: true } );
			expect( result ).toEqual( { type: EMAIL_VERIFY_REQUEST, showGlobalNotices: true } );
		} );
	} );

	describe( '#resetVerifyEmailState', () => {
		test( 'returns reset action', () => {
			const result = resetVerifyEmailState();
			expect( result ).toEqual( { type: EMAIL_VERIFY_STATE_RESET } );
		} );
	} );
} );
