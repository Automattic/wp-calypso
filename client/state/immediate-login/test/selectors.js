/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	wasImmediateLoginAttempted,
	wasAutoRenewalFailureImmediateLoginAttempted,
	wasImmediateLoginSuccessfulAccordingToClient,
	getImmediateLoginReason,
	getImmediateLoginEmail,
	getImmediateLoginLocale,
} from '../selectors';
import { REASON_AUTO_RENEWAL_FAILURE } from '../constants';

describe( 'immediate-login/selectors', () => {
	describe( 'wasImmediateLoginAttempted', () => {
		test( 'should return correct value from state [1]', () => {
			expect( wasImmediateLoginAttempted( {} ) ).toEqual( false );
		} );

		test( 'should return correct value from state [2]', () => {
			expect( wasImmediateLoginAttempted( { immediateLogin: { attempt: false } } ) ).toEqual(
				false
			);
		} );

		test( 'should return correct value from state [3]', () => {
			expect( wasImmediateLoginAttempted( { immediateLogin: { attempt: true } } ) ).toEqual( true );
		} );
	} );
	describe( 'wasAutoRenewalFailureImmediateLoginAttempted', () => {
		test( 'should return correct value from state [1]', () => {
			expect( wasAutoRenewalFailureImmediateLoginAttempted( {} ) ).toEqual( false );
		} );

		test( 'should return correct value from state [2]', () => {
			expect(
				wasAutoRenewalFailureImmediateLoginAttempted( {
					immediateLogin: { reason: 'test reason' },
				} )
			).toEqual( false );
		} );

		test( 'should return correct value from state [3]', () => {
			expect(
				wasAutoRenewalFailureImmediateLoginAttempted( {
					immediateLogin: { reason: REASON_AUTO_RENEWAL_FAILURE },
				} )
			).toEqual( true );
		} );
	} );
	describe( 'wasImmediateLoginSuccessfulAccordingToClient', () => {
		test( 'should return correct value from state [1]', () => {
			expect( wasImmediateLoginSuccessfulAccordingToClient( {} ) ).toEqual( false );
		} );

		test( 'should return correct value from state [2]', () => {
			expect(
				wasImmediateLoginSuccessfulAccordingToClient( { immediateLogin: { success: false } } )
			).toEqual( false );
		} );

		test( 'should return correct value from state [3]', () => {
			expect(
				wasImmediateLoginSuccessfulAccordingToClient( { immediateLogin: { success: true } } )
			).toEqual( true );
		} );
	} );
	describe( 'getImmediateLoginReason', () => {
		test( 'should return correct value from state [1]', () => {
			expect( getImmediateLoginReason( {} ) ).toEqual( null );
		} );

		test( 'should return correct value from state [2]', () => {
			expect( getImmediateLoginReason( { immediateLogin: { reason: 'test reason' } } ) ).toEqual(
				'test reason'
			);
		} );
	} );
	describe( 'getImmediateLoginEmail', () => {
		test( 'should return correct value from state [1]', () => {
			expect( getImmediateLoginEmail( {} ) ).toEqual( null );
		} );

		test( 'should return correct value from state [2]', () => {
			expect( getImmediateLoginEmail( { immediateLogin: { email: 'test@example.com' } } ) ).toEqual(
				'test@example.com'
			);
		} );
	} );
	describe( 'getImmediateLoginLocale', () => {
		test( 'should return correct value from state [1]', () => {
			expect( getImmediateLoginLocale( {} ) ).toEqual( null );
		} );

		test( 'should return correct value from state [2]', () => {
			expect( getImmediateLoginLocale( { immediateLogin: { locale: 'fr' } } ) ).toEqual( 'fr' );
		} );
	} );
} );
