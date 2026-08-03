import isNewUserEmailRedirect from '../is-new-user-email-redirect';

describe( 'isNewUserEmailRedirect', () => {
	test( 'should return false for null or empty input', () => {
		expect( isNewUserEmailRedirect( null ) ).toBe( false );
		expect( isNewUserEmailRedirect( '' ) ).toBe( false );
	} );

	test( 'should return true when newuseremail param is present', () => {
		const validUrls = [
			'https://wordpress.com/wp-login.php?newuseremail=abc123',
			'https://wordpress.com/wp-login.php?action=something&newuseremail=abc123',
			'https://wordpress.com/wp-login.php?newuseremail=',
		];

		validUrls.forEach( ( url ) => {
			expect( isNewUserEmailRedirect( url ) ).toBe( true );
		} );
	} );

	test( 'should return false when newuseremail param is absent', () => {
		const invalidUrls = [
			'https://wordpress.com/wp-login.php',
			'https://wordpress.com/wp-login.php?action=lostpassword',
		];

		invalidUrls.forEach( ( url ) => {
			expect( isNewUserEmailRedirect( url ) ).toBe( false );
		} );
	} );
} );
