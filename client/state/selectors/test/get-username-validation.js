/** @format */

/**
 * Internal dependencies
 */
import getUsernameValidation from 'state/selectors/get-username-validation';

describe( 'getUsernameValidation', () => {
	test( 'return `false` if validation result is cleared', () => {
		expect( getUsernameValidation( {} ) ).toBe( false );
	} );

	test( 'return the validation result if it exists', () => {
		expect(
			getUsernameValidation( {
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
			success: true,
			allowedActions: {
				new: 'Yes, create a new blog to match my new user name',
				none: "No, don't create a matching blog address.",
			},
			validatedUsername: 'new_username',
		} );
	} );
} );
