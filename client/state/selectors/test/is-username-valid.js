/** @format */

/**
 * Internal dependencies
 */
import isUsernameValid from 'state/selectors/is-username-valid';

describe( 'isUsernameValid', () => {
	test( 'return `false` if validation result is cleared', () => {
		expect( isUsernameValid( {} ) ).toBe( false );
	} );

	test( 'return `true` if the new username is valid', () => {
		expect(
			isUsernameValid( {
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
		).toBe( true );
	} );

	test( 'return `false` if the new username is not valid', () => {
		expect(
			isUsernameValid( {
				username: {
					validation: {
						error: 'invalid_input',
						message: 'Usernames must be at least 4 characters.',
					},
				},
			} )
		).toBe( false );
	} );
} );
