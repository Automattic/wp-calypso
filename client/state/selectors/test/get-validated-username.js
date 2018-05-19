/** @format */

/**
 * Internal dependencies
 */
import getValidatedUsername from 'state/selectors/get-validated-username';

describe( 'getValidatedUsername', () => {
	test( 'return null if validation result is cleared', () => {
		expect( getValidatedUsername( {} ) ).toEqual( null );
	} );

	test( 'return the new username if it is valid', () => {
		expect(
			getValidatedUsername( {
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
		).toEqual( 'new_username' );
	} );

	test( 'return null if the new username is not valid', () => {
		expect(
			getValidatedUsername( {
				username: {
					validation: {
						error: 'invalid_input',
						message: 'Usernames must be at least 4 characters.',
					},
				},
			} )
		).toEqual( null );
	} );
} );
