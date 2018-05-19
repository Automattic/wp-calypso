/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as actions from '../actions';
import { USERNAME_CLEAR_VALIDATION, USERNAME_VALIDATION_FAILURE } from 'state/action-types';

describe( 'actions', () => {
	const dispatchSpy = jest.fn();

	test( '#clearUsernameValidation', () => {
		expect( actions.clearUsernameValidation() ).toEqual( { type: USERNAME_CLEAR_VALIDATION } );
	} );

	describe( '#validateUsername', () => {
		test( 'return error for invalid username (length < 4)', () => {
			actions.validateUsername( 'usr' )( dispatchSpy );
			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: USERNAME_VALIDATION_FAILURE,
				error: 'invalid_input',
				message: i18n.translate( 'Usernames must be at least 4 characters.' ),
			} );
		} );

		test( 'return error for invalid username (uppercase letters)', () => {
			actions.validateUsername( 'USER' )( dispatchSpy );
			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: USERNAME_VALIDATION_FAILURE,
				error: 'invalid_input',
				message: i18n.translate(
					'Usernames can only contain lowercase letters (a-z) and numbers.'
				),
			} );
		} );
	} );
} );
