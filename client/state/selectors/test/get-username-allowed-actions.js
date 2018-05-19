/** @format */

/**
 * Internal dependencies
 */
import getUsernameAllowedActions from 'state/selectors/get-username-allowed-actions';

describe( 'getUsernameAllowedActions', () => {
	test( 'return {} if validation result is cleared', () => {
		expect( getUsernameAllowedActions( {} ) ).toEqual( {} );
	} );

	test( 'return allowed actions if the new username is valid', () => {
		expect(
			getUsernameAllowedActions( {
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
		).toEqual( {
			new: 'Yes, create a new blog to match my new user name',
			none: "No, don't create a matching blog address.",
		} );
	} );

	test( 'return {} if the new username is not valid', () => {
		expect(
			getUsernameAllowedActions( {
				username: {
					validation: {
						error: 'invalid_input',
						message: 'Usernames must be at least 4 characters.',
					},
				},
			} )
		).toEqual( {} );
	} );
} );
