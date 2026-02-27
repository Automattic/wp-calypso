import nock from 'nock';
import {
	validateUsernameInternal,
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
	type ValidationResult,
} from '../username-validation-utils';

describe( 'Username Validation Utils', () => {
	describe( 'validateUsernameInternal', () => {
		test( 'skips validation when username matches current username', async () => {
			const setValidationResult = jest.fn();

			await validateUsernameInternal( 'sameusername', 'sameusername', setValidationResult );

			expect( setValidationResult ).toHaveBeenCalledWith( null );
		} );

		test( 'validates minimum length requirement', async () => {
			const setValidationResult = jest.fn();

			await validateUsernameInternal( 'ab', 'oldusername', setValidationResult );

			expect( setValidationResult ).toHaveBeenCalledWith( {
				error: 'invalid_input',
				message: 'Usernames must be at least 4 characters.',
			} );
		} );

		test( 'validates allowed characters', async () => {
			const setValidationResult = jest.fn();

			await validateUsernameInternal( 'user@name', 'oldusername', setValidationResult );

			expect( setValidationResult ).toHaveBeenCalledWith( {
				error: 'invalid_input',
				message: 'Usernames can only contain lowercase letters (a-z) and numbers.',
			} );
		} );

		test( 'calls the API and sets validation result on success', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me/username/validate/newusername' )
				.reply( 200, {
					success: true,
					allowed_actions: { none: 'Just change username' },
				} );

			const setValidationResult = jest.fn();

			await validateUsernameInternal( 'newusername', 'oldusername', setValidationResult );

			expect( scope.isDone() ).toBe( true );
			expect( setValidationResult ).toHaveBeenCalledWith( {
				success: true,
				allowed_actions: { none: 'Just change username' },
				validatedUsername: 'newusername',
			} );
		} );

		test( 'sets error result on API failure', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me/username/validate/takenusername' )
				.reply( 400, {
					error: 'username_taken',
					message: 'Username is already taken',
				} );

			const setValidationResult = jest.fn();

			await validateUsernameInternal( 'takenusername', 'oldusername', setValidationResult );

			expect( setValidationResult ).toHaveBeenCalledWith(
				expect.objectContaining( {
					error: 'username_taken',
					message: 'Username is already taken',
				} )
			);
		} );
	} );

	describe( 'isUsernameValid', () => {
		test( 'returns true for valid validation result', () => {
			const validResult: ValidationResult = { success: true };
			expect( isUsernameValid( validResult ) ).toBe( true );
		} );

		test( 'returns false for null validation result', () => {
			expect( isUsernameValid( null ) ).toBe( false );
		} );

		test( 'returns false for validation result with error', () => {
			const errorResult: ValidationResult = {
				error: 'username_taken',
				message: 'Username is already taken',
			};
			expect( isUsernameValid( errorResult ) ).toBe( false );
		} );
	} );

	describe( 'getUsernameValidationMessage', () => {
		test( 'returns message or null correctly', () => {
			expect( getUsernameValidationMessage( { message: 'error' } ) ).toBe( 'error' );
			expect( getUsernameValidationMessage( { error: 'no message' } ) ).toBe( null );
			expect( getUsernameValidationMessage( null ) ).toBe( null );
		} );
	} );

	describe( 'getAllowedActions', () => {
		test( 'returns allowed actions from validation result', () => {
			const result: ValidationResult = {
				success: true,
				allowed_actions: {
					none: 'Just change username',
					redirect: 'Create matching blog address',
				},
			};
			expect( getAllowedActions( result ) ).toEqual( {
				none: 'Just change username',
				redirect: 'Create matching blog address',
			} );
		} );

		test( 'returns empty object for validation result without allowed_actions', () => {
			const result: ValidationResult = { success: true };
			expect( getAllowedActions( result ) ).toEqual( {} );
		} );
	} );
} );
