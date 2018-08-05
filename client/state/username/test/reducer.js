/** @format */

/**
 * Internal dependencies
 */
import reducer, { DEFAULT_STATE } from '../reducer';
import { USERNAME_VALIDATION_FAILURE } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should return default state if no other actions are triggered yet', () => {
		const usernameState = reducer( null );
		expect( usernameState ).toEqual( DEFAULT_STATE );
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
} );
