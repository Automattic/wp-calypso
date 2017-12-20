/** @format */

/**
 * Internal dependencies
 */
import signupForm, { timezone, message } from '../reducer';
import { CONCIERGE_SIGNUP_FORM_UPDATE } from 'state/action-types';

describe( 'concierge/signupForm/reducer', () => {
	const mockSignupForm = {
		timezone: 'UTC',
		message: 'hello',
	};

	const updateForm = {
		type: CONCIERGE_SIGNUP_FORM_UPDATE,
		signupForm: mockSignupForm,
	};

	describe( 'timezone', () => {
		test( 'should be defaulted as null.', () => {
			expect( timezone( undefined, {} ) ).toBeNull();
		} );

		test( 'should return the timezone of the update action', () => {
			expect( timezone( {}, updateForm ) ).toEqual( mockSignupForm.timezone );
		} );
	} );

	describe( 'message', () => {
		test( 'should be defaulted as null.', () => {
			expect( message( undefined, {} ) ).toBeNull();
		} );

		test( 'should return the message of the update action', () => {
			expect( message( {}, updateForm ) ).toEqual( mockSignupForm.message );
		} );
	} );

	describe( 'signupForm', () => {
		test( 'should combine all defaults as null.', () => {
			expect( signupForm( undefined, {} ) ).toEqual( { timezone: null, message: null } );
		} );

		test( 'should return the proper message and timezone of the update action', () => {
			expect( signupForm( {}, updateForm ) ).toEqual( mockSignupForm );
		} );
	} );
} );
