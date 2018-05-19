/** @format */

/**
 * Internal dependencies
 */
import getUsernameValidationFailureMessage from 'state/selectors/get-username-validation-failure-message';

describe( 'getUsernameValidationFailureMessage', () => {
	test( 'return null if validation result is cleared', () => {
		expect( getUsernameValidationFailureMessage( {} ) ).toEqual( null );
	} );

	test( 'return null if the new username is valid', () => {
		expect(
			getUsernameValidationFailureMessage( {
				username: {
					validation: {
						success: true,
						allowedActions: {
							new: 'Yes, create a new blog to match my new user name',
							none: "No, don't create a matching blog address.",
						},
						validatedUsername: 'new_username',
					},
				},
			} )
		).toEqual( null );
	} );

	test( 'return the validation failure message if the new username is not valid', () => {
		expect(
			getUsernameValidationFailureMessage( {
				username: {
					validation: {
						error: 'invalid_input',
						message: 'Usernames must be at least 4 characters.',
					},
				},
			} )
		).toEqual( 'Usernames must be at least 4 characters.' );
	} );
} );
