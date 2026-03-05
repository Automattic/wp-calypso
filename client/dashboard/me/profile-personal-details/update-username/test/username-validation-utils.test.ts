import nock from 'nock';
import { validateUsernameInternal } from '../username-validation-utils';

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
} );
