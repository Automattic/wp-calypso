/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	USERNAME_CLEAR_VALIDATION,
	USERNAME_VALIDATION_FAILURE,
	USERNAME_VALIDATION_SUCCESS,
} from 'state/action-types';
import { USERNAME_DEFAULT } from 'state/username/constants';

describe( 'reducer', () => {
	test( 'should return default state if no other actions are triggered yet', () => {
		const usernameState = reducer( null );
		expect( usernameState ).toEqual( USERNAME_DEFAULT );
	} );

	describe( USERNAME_CLEAR_VALIDATION, () => {
		test( 'reset username validation data to default state', () => {
			const previousState = {};
			const usernameState = reducer( previousState, { type: USERNAME_CLEAR_VALIDATION } );
			expect( usernameState ).toEqual( USERNAME_DEFAULT );
		} );
	} );

	describe( USERNAME_VALIDATION_FAILURE, () => {
		test( 'set error type and error message', () => {
			const usernameState = reducer( null, {
				type: USERNAME_VALIDATION_FAILURE,
				error: 'invalid_input',
				message: 'Usernames must be at least 4 characters.',
			} );
			expect( usernameState ).toEqual( {
				validation: {
					error: 'invalid_input',
					message: 'Usernames must be at least 4 characters.',
				},
			} );
		} );
	} );

	describe( USERNAME_VALIDATION_SUCCESS, () => {
		test( 'set validation.success to `true`, validation.allowedActions, and validation.validatedUsername', () => {
			const usernameState = reducer( null, {
				type: USERNAME_VALIDATION_SUCCESS,
				allowedActions: {
					new: 'Yes, create a new blog to match my new user name',
					none: "No, don't create a matching blog address.",
				},
				validatedUsername: 'newusername',
			} );
			expect( usernameState ).toEqual( {
				validation: {
					success: true,
					allowedActions: {
						new: 'Yes, create a new blog to match my new user name',
						none: "No, don't create a matching blog address.",
					},
					validatedUsername: 'newusername',
				},
			} );
		} );
	} );
} );
