import isUserAccountEmailUpdateRedirect from '../is-user-account-email-update-redirect';

describe( 'isUserAccountEmailUpdateRedirect', () => {
	test( 'should return false for null or empty input', () => {
		expect( isUserAccountEmailUpdateRedirect( null ) ).toBe( false );
		expect( isUserAccountEmailUpdateRedirect( '' ) ).toBe( false );
	} );

	test( 'should return true when newuseremail param is present', () => {
		const validUrls = [
			'https://wordpress.com/wp-login.php?newuseremail=abc123',
			'https://wordpress.com/wp-login.php?action=something&newuseremail=abc123',
			'https://wordpress.com/wp-login.php?newuseremail=',
		];

		validUrls.forEach( ( url ) => {
			expect( isUserAccountEmailUpdateRedirect( url ) ).toBe( true );
		} );
	} );

	test( 'should return false when newuseremail param is absent', () => {
		const invalidUrls = [
			'https://wordpress.com/wp-login.php',
			'https://wordpress.com/wp-login.php?action=lostpassword',
		];

		invalidUrls.forEach( ( url ) => {
			expect( isUserAccountEmailUpdateRedirect( url ) ).toBe( false );
		} );
	} );
} );
